import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }
  async findUserById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    return user;
  }

  async createUser(userData: DeepPartial<User>) {
    const dbUser = await this.findUserByEmail(userData.email);
    if (dbUser) throw new ConflictException('email is already taken');
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async updateUser(userData: DeepPartial<User>, user: User): Promise<User> {
    return this.userRepository.save({ ...user, ...userData });
  }

  async updateUserInstance(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
}
