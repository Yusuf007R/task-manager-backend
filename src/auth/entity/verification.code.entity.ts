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

export enum TokenType {
  passwordResetCode,
  emailVerificationCode,
  changeEmailCode,
}

@Entity()
export class VerificationCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: TokenType,
    default: TokenType.emailVerificationCode,
  })
  tokenType: TokenType;

  @ManyToOne(() => User)
  @JoinColumn()
  @Index()
  user: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
