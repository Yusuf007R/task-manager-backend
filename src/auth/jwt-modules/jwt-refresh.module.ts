import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('AUTH_JWT_REFRESH'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'JwtRefresh',
      useExisting: JwtService,
    },
  ],
  exports: ['JwtRefresh'],
})
export class JwtRefreshModule {}
