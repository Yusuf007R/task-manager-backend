import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Task } from 'src/task/entity/task.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  imageUrl: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @Column({ default: false })
  verified: boolean;

  @OneToMany(() => Task, (task) => task.user)
  task: Task;

  @Exclude()
  @Column()
  password: string;
}
