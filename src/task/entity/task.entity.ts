import { Category } from 'src/category/entity/category.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  isCompleted: boolean;

  @Column()
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, {
    nullable: true,
    onDelete: 'SET NULL',
    cascade: true,
  })
  @JoinColumn()
  @Index()
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  @Index()
  user: User;

  @Column()
  userId: string;
}
