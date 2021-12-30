import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAccessNotVerifiedAuthGuard extends AuthGuard(
  'jwt-access-not-verified',
) {}
