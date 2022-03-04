import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from './decorator/get-user.decorator';
import { User } from './entity/user.entity';
import { JwtAccessNotVerifiedAuthGuard } from 'src/auth/guard/jwt-access-not-verified-auth.guard';
import { ApiResponse } from '@nestjs/swagger';
import { UserUpdateDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { SetPublic } from 'src/auth/decorator/set-public.decorator';

import { FirebaseService } from 'src/firebase/firebase.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    readonly firebaseService: FirebaseService,
  ) {}

  @ApiResponse({
    type: User,
  })
  @Get()
  @SetPublic()
  @UseGuards(JwtAccessNotVerifiedAuthGuard)
  getHello(@GetUser() user: User) {
    return user;
  }

  @Patch()
  updateUser(@Body() body: UserUpdateDto, @GetUser() user: User) {
    return this.userService.updateUser(body, user);
  }
}
