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
import { RefreshToken } from './entity/refresh-token.entity';
import { VerificationCode } from './entity/verification.code.entity';
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
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
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
    return {
      accessToken: await this.generateAccessToken(user),
      refreshToken: await this.generateRefreshToken(user, ip),
    };
  }

  async updateRefreshToken(jwt: string, ip: string) {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: jwt },
    });
    if (!token) throw new UnauthorizedException('token not found');
    token.ipAddress = ip;
    token.lastTimeOfUse = new Date();
    return await this.refreshTokenRepository.save(token);
  }

  async generateAccessToken(user: User) {
    return await this.jwtAccess.signAsync({
      id: user.id,
      verified: user.verified,
      type: 'access',
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
    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      lastTimeOfUse: new Date(),
      ipAddress: ip,
    });
    await this.refreshTokenRepository.save(refreshToken);
    return token;
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
    const tokenDB = await this.refreshTokenRepository.findOne({
      where: { token },
    });
    return await this.refreshTokenRepository.remove(tokenDB);
  }

  async logoutAll(user: User) {
    const tokenDB = await this.refreshTokenRepository.find({ where: { user } });
    return await this.refreshTokenRepository.remove(tokenDB);
  }

  async getVerificationCode(user: User, isPasswordResetCode = false) {
    if (user.verified && !isPasswordResetCode)
      throw new ForbiddenException('user already verified');
    const date = this.helperService.generateDatePlusMins(-2);
    const userCode = await this.verificationTokenRepository.findOne({
      where: {
        user,
        isPasswordResetCode,
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
      isPasswordResetCode: isPasswordResetCode,
    });
    return await this.verificationTokenRepository.save(verificationCode);
  }

  async verifyCode(user: User, code: string, isPasswordResetCode = false) {
    if (user.verified && !isPasswordResetCode)
      throw new ForbiddenException('user already verified');
    const verificationCode = await this.verificationTokenRepository.findOne({
      where: { user, code, isPasswordResetCode },
    });
    if (!verificationCode) throw new UnauthorizedException('invalid code');
    const date = this.helperService.generateDatePlusMins(-5);
    if (verificationCode.createdAt.getTime() < date.getTime()) {
      throw new UnauthorizedException('expired code');
    }
    const codes = await this.verificationTokenRepository.find({
      where: { user, isPasswordResetCode },
    });
    return await this.verificationTokenRepository.remove(codes);
  }

  async getActiveSessions(user: User) {
    const tokenDB = await this.refreshTokenRepository.find({ where: { user } });

    return tokenDB.map((token) => ({
      ip: token.ipAddress,
      lastTimeOfUse: token.lastTimeOfUse,
      sessionId: token.id,
    }));
  }

  async revokeSession(user: User, sessionId: string) {
    const tokenDB = await this.refreshTokenRepository.findOne({
      where: { id: sessionId, user },
    });

    if (!tokenDB) throw new NotFoundException('session not found');
    return await this.refreshTokenRepository.remove(tokenDB);
  }
}
