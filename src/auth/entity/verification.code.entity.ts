import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class VerificationCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ default: false })
  isPasswordResetCode: boolean;

  @ManyToOne(() => User)
  @JoinColumn()
  @Index()
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
