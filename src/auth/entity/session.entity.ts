import { ApiProperty } from '@nestjs/swagger';
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
import { GeoLocation } from './geoLocation.entity';

@Entity()
export class Session {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  token: string;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User)
  @JoinColumn()
  @Index()
  user: User;

  @ApiProperty({ type: 'timestamptz' })
  @Column()
  lastTimeOfUse: Date;

  @ApiProperty()
  @Column()
  ipAddress: string;

  @ManyToOne(() => GeoLocation, {
    cascade: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  geoLocation: GeoLocation;

  @ApiProperty()
  @Column({ nullable: true })
  FCM: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
