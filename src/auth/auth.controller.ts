import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
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
import { ApiResponse } from '@nestjs/swagger';
import {
  AccessRefreshResponseDto,
  AccessResponseDto,
  GetActiveSessionDto,
  MessageResponseDto,
} from './dto/responses.dto';
import { RefreshToken } from './entity/refresh-token.entity';
import { JwtPasswordAuthGuard } from './guard/jwt-password-auth.guard';
import {
  changeForgotPasswordDto,
  ChangePasswordDto,
} from './dto/change-password.dto';
import {
  sendPasswordCodeDto,
  verifyCodeDto,
  verifyPasswordCodeDto,
} from './dto/codes.dot';
import { GetIp } from 'src/helper/decorator/get-ip.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @ApiResponse({ type: AccessRefreshResponseDto })
  @SetPublic()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @GetIp() ip: string) {
    return this.authService.validateLocal(loginDto, ip);
  }

  @ApiResponse({ type: AccessRefreshResponseDto })
  @SetPublic()
  @HttpCode(201)
  @Post('register')
  async register(@Body() registerDTo: RegisterDto, @GetIp() ip: string) {
    return await this.authService.register(registerDTo, ip);
  }

  @ApiResponse({ type: AccessResponseDto })
  @SetPublic()
  @UseGuards(JwtRefreshAuthGuard)
  @Get('access-token')
  async getNewAccessToken(
    @GetUser() user: User,
    @GetIp() ip: string,
    @GetJwt() jwtToken: string,
  ) {
    await this.authService.updateRefreshToken(jwtToken, ip);
    return {
      accessToken: await this.authService.generateAccessToken(user),
    };
  }

  @ApiResponse({ type: RefreshToken })
  @SetPublic()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('logout')
  async logout(@GetJwt() jwtToken: string) {
    return this.authService.logoutOne(jwtToken);
  }

  @ApiResponse({ type: [RefreshToken] })
  @SetPublic()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('logout/all')
  async logoutAll(@GetUser() user: User) {
    return this.authService.logoutAll(user);
  }

  @ApiResponse({ type: MessageResponseDto })
  @SetPublic()
  @UseGuards(JwtPasswordAuthGuard)
  @Post('change-forgot-password')
  async changeForgotPassword(
    @GetUser() user: User,
    @Body() body: changeForgotPasswordDto,
  ) {
    await this.authService.changePassword(user, body.password);
    return {
      message: 'Password changed, and All tokens revoked',
    };
  }

  @ApiResponse({ type: MessageResponseDto })
  @Post('change-password')
  async changePassword(@GetUser() user: User, @Body() body: ChangePasswordDto) {
    await this.authService.validatePassword(user, body.password);
    await this.authService.changePassword(user, body.newPassword);
    return {
      message: 'Password changed, and All tokens revoked',
    };
  }

  @SetPublic()
  @Post('send-account-verification-code')
  @ApiResponse({ type: MessageResponseDto })
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
  @Post('verify-account-code')
  @ApiResponse({ type: AccessResponseDto })
  @UseGuards(JwtAccessNotVerifiedAuthGuard)
  async verifyAccountCode(@GetUser() user: User, @Body() body: verifyCodeDto) {
    await this.authService.verifyCode(user, body.code);
    user.verified = true;
    await this.userService.updateUserInstance(user);
    return {
      accessToken: await this.authService.generateAccessToken(user),
    };
  }
  @SetPublic()
  @Post('send-password-reset-code')
  @ApiResponse({ type: MessageResponseDto })
  async sendPasswordCode(@Body() body: sendPasswordCodeDto) {
    const user = await this.userService.findUserByEmail(body.email);
    if (!user) throw new NotFoundException('User not found');
    const verificationCode = await this.authService.getVerificationCode(
      user,
      true,
    );
    await this.mailService.sendVerificationCode(
      body.email,
      verificationCode.code,
    );
    return {
      message: 'Verification code sent',
    };
  }

  @Post('verify-password-code')
  @SetPublic()
  @ApiResponse({ type: AccessResponseDto })
  async verifyPasswordCode(@Body() body: verifyPasswordCodeDto) {
    const user = await this.userService.findUserByEmail(body.email);
    if (!user) throw new NotFoundException('User not found');
    await this.authService.verifyCode(user, body.code, true);
    return {
      accessToken: await this.authService.generatePasswordToken(user),
    };
  }

  @Get('get-active-sessions')
  @ApiResponse({ type: GetActiveSessionDto })
  async GetActiveSessions(@GetUser() user: User) {
    return this.authService.getActiveSessions(user);
  }

  @Post('logout-by-session-id/:sessionId')
  @ApiResponse({ type: RefreshToken })
  async LogoutBySessionId(
    @GetUser() user: User,
    @Param('sessionId') sessionId: string,
  ) {
    return this.authService.revokeSession(user, sessionId);
  }
}
