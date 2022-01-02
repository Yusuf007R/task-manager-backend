import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from './decorator/get-user.decorator';
import { User } from './entity/user.entity';
import { JwtAccessNotVerifiedAuthGuard } from 'src/auth/guard/jwt-access-not-verified-auth.guard';
import { ApiResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  @ApiResponse({
    type: User,
  })
  @Get()
  @UseGuards(JwtAccessNotVerifiedAuthGuard)
  getHello(@GetUser() user: User) {
    return user;
  }
}
