import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/category/entity/category.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Task {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @Column()
  isCompleted: boolean;

  @ApiProperty()
  @Column()
  date: Date;

  @ApiProperty()
  @ManyToOne(() => Category, {
    nullable: true,
    onDelete: 'SET NULL',
    cascade: true,
  })
  @JoinColumn()
  @Index()
  category: Category;

  @ApiProperty()
  @Column({ nullable: true })
  categoryId: string;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User)
  @JoinColumn()
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
