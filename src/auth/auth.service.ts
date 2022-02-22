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
    private httpService: HttpService,
  ) {}

  async validateLocal(userData: LoginDto, ip) {
    const user = await this.userService.findUserByEmail(userData.email);
    if (!user) throw new NotFoundException('user not found');
    await this.validatePassword(user, userData.password);
    return this.login(user, ip);
  }

  async validatePassword(user: User, password: string) {
    if (await bcrypt.compare(password, user.password)) {
      return null;
    }
    throw new ForbiddenException('wrong password');
  }

  async login(user: User, ip: string) {
    const refreshToken = await this.generateRefreshToken(user, ip);
    return {
      accessToken: await this.generateAccessToken(user, refreshToken.id),
      refreshToken: refreshToken.token,
    };
  }

  async updateRefreshToken(refreshToken: Session, ip: string) {
    refreshToken.ipAddress = ip;
    refreshToken.lastTimeOfUse = new Date();
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

  async generatePasswordToken(user: User) {
    return await this.jwtPassword.signAsync({
      id: user.id,
      verified: user.verified,
      type: 'password',
    });
  }

  async generateRefreshToken(user: User, ip: string) {
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
    });
    return await this.sessionRepository.save(refreshToken);
  }

  async register(user: DeepPartial<User>, ip: string) {
    const { password, ...restUser } = user;
    const hash = await bcrypt.hash(password, 10);
    const userCreated = await this.userService.createUser({
      password: hash,
      ...restUser,
    });
    return this.login(userCreated, ip);
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
    return await this.sessionRepository.remove(tokenDB);
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
    const tokenDB = await this.sessionRepository.find({ where: { user } });
    const sessions = [];
    for (const token of tokenDB) {
      const response = await this.httpService.get(
        `https://ipapi.co/${token.ipAddress}/json/`,
      );
      const location = response?.data?.error ? null : response?.data;
      sessions.push({
        ip: token.ipAddress,
        lastTimeOfUse: token.lastTimeOfUse,
        sessionId: token.id,
        location: location,
      });
    }
    return sessions;
  }

  async revokeSession(user: User, sessionId: string) {
    const tokenDB = await this.sessionRepository.findOne({
      where: { id: sessionId, user },
    });

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

  async getUserFCMtokens(user: User, excludedToken: string) {
    const refreshTokens = await this.sessionRepository
      .createQueryBuilder('RefreshToken')
      .where('RefreshToken.userId = :userId', { userId: user.id })
      .andWhere('RefreshToken.FCM != :fcm', { fcm: excludedToken })
      .andWhere('RefreshToken.FCM is not null')
      .getMany();

    return refreshTokens.map((token) => token.FCM);
  }

  async updateFCMToken(refreshToken: Session, fcmToken: string) {
    refreshToken.FCM = fcmToken;
    return await this.sessionRepository.save(refreshToken);
  }
}
