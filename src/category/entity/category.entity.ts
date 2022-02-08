import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Category {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ type: 'bigint' })
  @Type(() => Number)
  color: number;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User)
  @Index()
  user: User;

  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @Column({ default: () => 'NOW()', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @Column({ default: () => 'NOW()', type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
