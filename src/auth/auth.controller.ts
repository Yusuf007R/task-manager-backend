import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import LoginDto from './dto/login.dto';
import { AuthService } from './auth.service';
import RegisterDto from './dto/register.dto';
import { JwtRefreshAuthGuard } from './guard/jwt-refresh-auth.guard';
import { GetJwt } from './decorator/get-jwt.decorator';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { User } from 'src/user/entity/user.entity';
import { JwtAccessNotVerifiedAuthGuard } from './guard/jwt-access-not-verified-auth.guard';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { SetPublic } from './decorator/set-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @SetPublic()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.validateLocal(loginDto);
  }

  @SetPublic()
  @HttpCode(201)
  @Post('register')
  async register(@Body() registerDTo: RegisterDto) {
    return await this.authService.register(registerDTo);
  }

  @SetPublic()
  @UseGuards(JwtRefreshAuthGuard)
  @Get('accesstoken')
  async getNewAccessToken(@GetUser() user: User) {
    return {
      access_token: await this.authService.generateAccessToken(user),
    };
  }

  @SetPublic()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('logout')
  async logout(@GetJwt() jwtToken: string) {
    return this.authService.logoutOne(jwtToken);
  }

  @SetPublic()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('logout/all')
  async logoutAll(@GetUser() user: User) {
    return this.authService.logoutAll(user);
  }

  @SetPublic()
  @Get('sendAccountVerificationCode')
  @UseGuards(JwtAccessNotVerifiedAuthGuard)
  async sendAccountVerificationCode(@GetUser() user: User) {
    const verificationCode = await this.authService.getVerificationCode(user);
    await this.mailService.sendVerificationCode(
      user.email,
      verificationCode.code,
    );
    return {
      message: 'Verification code sent',
    };
  }

  @SetPublic()
  @Get('verifyAccountCode/:code')
  @UseGuards(JwtAccessNotVerifiedAuthGuard)
  async verifyAccountCode(@GetUser() user: User, @Param('code') code: string) {
    await this.authService.verifyCode(user, code);
    user.verified = true;
    await this.userService.updateUserInstance(user);
    return {
      access_token: await this.authService.generateAccessToken(user),
    };
  }
}
