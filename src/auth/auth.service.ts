import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

import { User } from 'src/user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { DeepPartial, MoreThan, Repository } from 'typeorm';
import LoginDto from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entity/session.entity';
import { TokenType, VerificationCode } from './entity/verification.code.entity';
import { HelperService } from 'src/helper/helper.service';
import { HttpService } from 'nestjs-http-promise';
import { GeoLocation } from './entity/geoLocation.entity';
import { location } from './dto/location.dto';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private helperService: HelperService,
    @Inject('JwtAccess') private jwtAccess: JwtService,
    @Inject('JwtRefresh') private jwtRefresh: JwtService,
    @Inject('JwtPassword') private jwtPassword: JwtService,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(VerificationCode)
    private verificationTokenRepository: Repository<VerificationCode>,
    @InjectRepository(GeoLocation)
    private geoLocationRepository: Repository<GeoLocation>,
    private httpService: HttpService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async validateLocal(userData: LoginDto, ip: string, deviceName: string) {
    const user = await this.userService.findUserByEmail(userData.email);
    if (!user) throw new NotFoundException('user not found');
    await this.validatePassword(user, userData.password);
    return this.login(user, ip, deviceName);
  }

  async validatePassword(user: User, password: string) {
    if (await bcrypt.compare(password, user.password)) {
      return null;
    }
    throw new ForbiddenException('wrong password');
  }

  async login(user: User, ip: string, deviceName: string) {
    const refreshToken = await this.generateRefreshToken(user, ip, deviceName);
    return {
      accessToken: await this.generateAccessToken(user, refreshToken.id),
      refreshToken: refreshToken.token,
    };
  }

  async updateRefreshToken(
    refreshToken: Session,
    ip: string,
    deviceName: string,
  ) {
    const geoLocation = await this.getGeoLocation(ip);
    if (refreshToken.ipAddress !== ip) {
      if (refreshToken.geoLocation) {
        const oldGeoLocation = await this.geoLocationRepository.findOne({
          where: { id: refreshToken.geoLocation.id },
        });
        await this.geoLocationRepository.remove(oldGeoLocation);
      }
    }
    refreshToken.ipAddress = ip;
    refreshToken.lastTimeOfUse = new Date();
    refreshToken.geoLocation = geoLocation;
    refreshToken.deviceName = deviceName;
    return await this.sessionRepository.save(refreshToken);
  }

  async generateAccessToken(user: User, sessionId: number) {
    return await this.jwtAccess.signAsync({
      id: user.id,
      verified: user.verified,
      type: 'access',
      sessionId,
    });
  }

  async getGeoLocation(ip: string) {
    const session = await this.sessionRepository.findOne({
      where: { ipAddress: ip },
      relations: ['geoLocation'],
    });
    const geolocationDB = session.geoLocation;

    if (!geolocationDB) {
      try {
        const response = await this.httpService.get<location>(
          `https://ipapi.co/${ip}/json/`,
        );
        const location = response?.data?.error ? null : response?.data;
        const geoLocation = this.geoLocationRepository.create({
          city: location.city,
          country: location.country_name,
          lat: location.latitude,
          lon: location.longitude,
          countryCode: location.country_code,
          region: location.region,
        });
        return await this.geoLocationRepository.save(geoLocation);
      } catch (error) {
        return null;
      }
    } else {
      if (
        geolocationDB.createdAt > this.helperService.generateDatePlusMins(43800)
      ) {
        const response = await this.httpService.get<location>(
          `https://ipapi.co/${ip}/json/`,
        );
        const location = response?.data?.error ? null : response?.data;
        return await this.geoLocationRepository.save({
          city: location.city,
          country: location.country_name,
          lat: location.latitude,
          lon: location.longitude,
          countryCode: location.country_code,
          region: location.region,
        });
      }
      return geolocationDB;
    }
  }

  async generatePasswordToken(user: User) {
    return await this.jwtPassword.signAsync({
      id: user.id,
      verified: user.verified,
      type: 'password',
    });
  }

  async generateRefreshToken(user: User, ip: string, deviceName: string) {
    const token = await this.jwtRefresh.signAsync({
      id: user.id,
      verified: user.verified,
      type: 'refresh',
    });

    const refreshToken = this.sessionRepository.create({
      token,
      user,
      lastTimeOfUse: new Date(),
      ipAddress: ip,
      deviceName,
    });
    const session = await this.sessionRepository.save(refreshToken);
    const fcmTokens = await this.getUserFCMtokens(user);
    await this.firebaseService.sendBatchNotify(
      fcmTokens,
      'new-session',
      session.id,
    );
    return session;
  }

  async register(user: DeepPartial<User>, ip: string, deviceName: string) {
    const { password, ...restUser } = user;
    const hash = await bcrypt.hash(password, 10);
    const userCreated = await this.userService.createUser({
      password: hash,
      ...restUser,
    });
    return this.login(userCreated, ip, deviceName);
  }

  async changePassword(user: User, password: string) {
    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    await this.userService.updateUserInstance(user);
    return await this.logoutAll(user);
  }

  async logoutOne(token: string) {
    const tokenDB = await this.sessionRepository.findOne({
      where: { token },
    });
    return await this.sessionRepository.remove(tokenDB);
  }

  async logoutAll(user: User) {
    const tokenDB = await this.sessionRepository.find({ where: { user } });
    const removed = await this.sessionRepository.remove(tokenDB);
    await this.firebaseService.sendBatchNotify(
      tokenDB.map((token) => token.FCM),
      'logout',
    );
    return removed;
  }

  async getVerificationCode(user: User, tokenType: TokenType, email?: string) {
    if (user.verified && tokenType === TokenType.emailVerificationCode)
      throw new ForbiddenException('user already verified');
    const date = this.helperService.generateDatePlusMins(-2);
    const userCode = await this.verificationTokenRepository.findOne({
      where: {
        user,
        tokenType,
        createdAt: MoreThan(date),
      },
    });
    if (userCode)
      throw new ConflictException(
        userCode.createdAt.toISOString(),
        'conflict, code already sent',
      );
    const code = this.helperService.generateRandomString(4);
    const verificationCode = this.verificationTokenRepository.create({
      code: code,
      user,
      tokenType,
      email: email || user.email,
    });
    return await this.verificationTokenRepository.save(verificationCode);
  }

  async verifyCode(user: User, code: string, tokenType: TokenType) {
    if (user.verified && tokenType === TokenType.emailVerificationCode)
      throw new ForbiddenException('user already verified');
    const verificationCode = await this.verificationTokenRepository.findOne({
      where: { user, code, tokenType },
    });
    if (!verificationCode) throw new UnauthorizedException('invalid code');
    const date = this.helperService.generateDatePlusMins(-5);
    if (verificationCode.createdAt.getTime() < date.getTime()) {
      throw new UnauthorizedException('expired code');
    }
    const codes = await this.verificationTokenRepository.find({
      where: { user, tokenType },
    });
    if (tokenType != TokenType.changeEmailCode)
      return await this.verificationTokenRepository.remove(codes);

    await this.verificationTokenRepository.remove(codes);
    return verificationCode;
  }

  async getActiveSessions(user: User) {
    return await this.sessionRepository.find({
      where: { user },
      relations: ['geoLocation'],
    });
  }

  async revokeSession(user: User, sessionId: string) {
    const tokenDB = await this.sessionRepository.findOne({
      where: { id: sessionId, user },
    });
    if (tokenDB.FCM)
      await this.firebaseService.sendBatchNotify([tokenDB.FCM], 'logout');
    if (!tokenDB) throw new NotFoundException('session not found');
    return await this.sessionRepository.remove(tokenDB);
  }

  getJwtPayload(token: string, type: 'access' | 'refresh') {
    return type == 'access'
      ? this.jwtAccess.decode(token)
      : this.jwtRefresh.decode(token);
  }

  async getRefreshToken(id: number) {
    return await this.sessionRepository.findOne({ id });
  }

  async getUserFCMtokens(user: User, excludedToken?: string) {
    const refreshTokens = await this.sessionRepository
      .createQueryBuilder('RefreshToken')
      .where('RefreshToken.userId = :userId', { userId: user.id })
      .andWhere('RefreshToken.FCM is not null')
      .getMany();
    return refreshTokens
      .map((token) => token.FCM)
      .filter((fcm) => fcm != excludedToken);
  }

  async updateFCMToken(refreshToken: Session, fcmToken: string) {
    refreshToken.FCM = fcmToken;
    return await this.sessionRepository.save(refreshToken);
  }

  async sendNewUserDataNotify(user: User, sessionId: number) {
    const fcmTokens = await this.getUserFCMtokens(user);
    await this.firebaseService.sendBatchNotify(
      fcmTokens,
      'new-user-data',
      sessionId,
    );
  }
}
