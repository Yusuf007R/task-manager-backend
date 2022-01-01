import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtAccessNotVerifiedStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-not-verified',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('AUTH_JWT_ACCESS'),
    });
  }

  async validate(payload: any) {
    return payload.id;
  }
}
