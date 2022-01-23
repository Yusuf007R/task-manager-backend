import { ApiProperty } from '@nestjs/swagger';
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
  @Column({ type: 'int' })
  color: number;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User)
  @Index()
  user: User;

  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @Column({ default: () => 'NOW()' })
  createdAt: Date;

  @ApiProperty()
  @Column({ default: () => 'NOW()' })
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;
}
