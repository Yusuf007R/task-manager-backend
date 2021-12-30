import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';

import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';

import { JwtAccessNotVerifiedAuthGuard } from './auth/guard/jwt-access-not-verified-auth.guard';
import { MailService } from './mail/mail.service';
import { GetUser } from './user/decorator/get-user.decorator';
import { User } from './user/entity/user.entity';
import { LoadUserIncerceptor } from './user/interceptor/load-user.interceptor';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(JwtAccessNotVerifiedAuthGuard)
  @UseInterceptors(LoadUserIncerceptor)
  async initialRoute(@GetUser() user: User) {
    return user;
  }
}
