import {
  Injectable,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user.service';

@Injectable()
export class IdToUserPipe implements PipeTransform {
  constructor(private userService: UserService) {}

  async transform(value: any) {
    const user = this.userService.findUserById(value);
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}
