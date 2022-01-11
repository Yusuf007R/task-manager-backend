import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtPasswordStrategy extends PassportStrategy(
  Strategy,
  'jwt-password',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('AUTH_JWT_PASSWORD'),
    });
  }

  async validate(payload: any) {
    return payload.id;
  }
}
