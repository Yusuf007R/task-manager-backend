import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { GetUser } from './decorator/get-user.decorator';
import { User } from './entity/user.entity';
import { JwtAccessNotVerifiedAuthGuard } from 'src/auth/guard/jwt-access-not-verified-auth.guard';
import { ApiResponse } from '@nestjs/swagger';
import { JwtAccessAuthGuard } from 'src/auth/guard/jwt-access-auth.guard';
import { UserUpdateDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiResponse({
    type: User,
  })
  @Get()
  @UseGuards(JwtAccessNotVerifiedAuthGuard)
  getHello(@GetUser() user: User) {
    return user;
  }

  @Put()
  @UseGuards(JwtAccessAuthGuard)
  updateUser(@Body() body: UserUpdateDto, @GetUser() user: User) {
    return this.userService.updateUser(body, user);
  }
}
