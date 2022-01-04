import { Controller, Get, UseGuards } from '@nestjs/common';
import { SetPublic } from './auth/decorator/set-public.decorator';
import { JwtAccessNotVerifiedAuthGuard } from './auth/guard/jwt-access-not-verified-auth.guard';
import { GetUser } from './user/decorator/get-user.decorator';
import { User } from './user/entity/user.entity';

@Controller()
export class AppController {
  @SetPublic()
  @Get()
  @UseGuards(JwtAccessNotVerifiedAuthGuard)
  async initialRoute(@GetUser() user: User) {
    return user;
  }
}
