import { Injectable } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtPasswordAuthGuard extends AuthGuard('jwt-password') {}
