import { Global, Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { JwtAccessStrategy } from './strategy/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { JwtAccessModule } from 'src/auth/jwt-modules/jwt-access.module';
import { JwtRefreshModule } from 'src/auth/jwt-modules/jwt-refresh.module';
import { RefreshToken } from './entity/refresh-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCode } from './entity/verification.code.entity';
import { JwtAccessNotVerifiedStrategy } from './strategy/jwt-access-not-verified.strategy';
import { MailModule } from 'src/mail/mail.module';

import { JwtPasswordModule } from './jwt-modules/jwt-password.module';
import { JwtPasswordStrategy } from './strategy/jwt-password.strategy';
import { HttpModule } from 'nestjs-http-promise';

@Global()
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtAccessModule,
    JwtRefreshModule,
    JwtPasswordModule,
    MailModule,
    HttpModule,
    TypeOrmModule.forFeature([RefreshToken, VerificationCode]),
  ],
  providers: [
    AuthService,
    JwtRefreshStrategy,
    JwtAccessStrategy,
    JwtPasswordStrategy,
    JwtAccessNotVerifiedStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
