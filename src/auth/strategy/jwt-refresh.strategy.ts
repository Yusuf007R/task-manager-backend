import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entity/refresh-token.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('AUTH_JWT_REFRESH'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader.replace('Bearer ', '');
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
    });
    if (!refreshToken) throw new UnauthorizedException();
    return payload.id;
  }
}
