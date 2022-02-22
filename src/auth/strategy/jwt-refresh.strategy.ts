import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Session } from '../entity/session.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('AUTH_JWT_REFRESH'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader.replace('Bearer ', '');
    const refreshToken = await this.sessionRepository.findOne({
      where: { token },
    });
    if (!refreshToken) throw new UnauthorizedException();
    req.refreshToken = refreshToken;
    return payload.id;
  }
}
