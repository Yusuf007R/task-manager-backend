import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('AUTH_JWT_PASSWORD'),
        signOptions: { expiresIn: '2m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'JwtPassword',
      useExisting: JwtService,
    },
  ],
  exports: ['JwtPassword'],
})
export class JwtPasswordModule {}
