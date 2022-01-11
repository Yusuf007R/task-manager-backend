import {
  Body,
  Controller,
  Get,
  HttpCode,
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
  async login(@Body() loginDto: LoginDto) {
    return this.authService.validateLocal(loginDto);
  }

  @ApiResponse({ type: AccessRefreshResponseDto })
  @SetPublic()
  @HttpCode(201)
  @Post('register')
  async register(@Body() registerDTo: RegisterDto) {
    return await this.authService.register(registerDTo);
  }

  @ApiResponse({ type: AccessResponseDto })
  @SetPublic()
  @UseGuards(JwtRefreshAuthGuard)
  @Get('access-token')
  async getNewAccessToken(@GetUser() user: User) {
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
    await this.authService.verifyCode(user, body.code, true);
    return {
      accessToken: await this.authService.generatePasswordToken(user),
    };
  }
}
