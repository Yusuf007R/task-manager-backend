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
  @Column({ type: 'timestamptz' })
  date: Date;

  @ApiProperty()
  @ManyToOne(() => Category, {
    nullable: true,
    onDelete: 'SET NULL',
    cascade: true,
  })
  @JoinColumn({ name: 'categoryId' })
  @Index()
  category: Category;

  @ApiProperty()
  @Column({ nullable: true, name: 'categoryId' })
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
  @Column({ default: () => 'NOW()', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @Column({ default: () => 'NOW()', type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
