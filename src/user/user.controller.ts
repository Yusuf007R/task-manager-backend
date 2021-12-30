import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { GetUser } from './decorator/get-user.decorator';
import { LoadUserIncerceptor } from './interceptor/load-user.interceptor';
import { User } from './entity/user.entity';
import { JwtAccessNotVerifiedAuthGuard } from 'src/auth/guard/jwt-access-not-verified-auth.guard';

@Controller('user')
export class UserController {
  @Get()
  @UseGuards(JwtAccessNotVerifiedAuthGuard)
  @UseInterceptors(LoadUserIncerceptor)
  getHello(@GetUser() user: User) {
    return user;
  }
}
