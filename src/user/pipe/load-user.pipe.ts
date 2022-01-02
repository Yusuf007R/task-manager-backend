import { Injectable, PipeTransform } from '@nestjs/common';
import { UserService } from '../user.service';

@Injectable()
export class IdToUserPipe implements PipeTransform {
  constructor(private userService: UserService) {}

  async transform(value: any) {
    return this.userService.findUserById(value);
  }
}
