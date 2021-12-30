import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
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
  user: User;

  @Column({ default: 10 })
  remainingAttempts: number;

  @CreateDateColumn()
  createdAt: Date;
}
