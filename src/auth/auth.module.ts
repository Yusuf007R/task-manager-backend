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
import { HelperModule } from 'src/helper/helper.module';
import { MailModule } from 'src/mail/mail.module';

@Global()
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtAccessModule,
    JwtRefreshModule,
    HelperModule,
    MailModule,
    TypeOrmModule.forFeature([RefreshToken, VerificationCode]),
  ],
  providers: [
    AuthService,
    JwtRefreshStrategy,
    JwtAccessStrategy,
    JwtAccessNotVerifiedStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
