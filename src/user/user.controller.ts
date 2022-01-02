import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from './decorator/get-user.decorator';
import { User } from './entity/user.entity';
import { JwtAccessNotVerifiedAuthGuard } from 'src/auth/guard/jwt-access-not-verified-auth.guard';

@Controller('user')
export class UserController {
  @Get()
  @UseGuards(JwtAccessNotVerifiedAuthGuard)
  getHello(@GetUser() user: User) {
    return user;
  }
}
