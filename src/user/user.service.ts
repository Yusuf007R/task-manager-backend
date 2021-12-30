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

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOneOrFail({ where: { email } });
    } catch (error) {
      return null;
    }
  }
  async findUserById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      return null;
    }
  }

  async createUser(userData: DeepPartial<User>): Promise<User | null> {
    const dbUser = await this.findUserByEmail(userData.email);
    if (dbUser) throw new ConflictException('email is already taken');
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async updateUserInstance(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
}
