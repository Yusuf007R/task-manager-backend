import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class GeoLocation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ nullable: true })
  country: string;

  @ApiProperty()
  @Column({ nullable: true })
  countryCode: string;

  @ApiProperty()
  @Column({ nullable: true })
  region: string;

  @ApiProperty()
  @Column({ nullable: true })
  city: string;

  @ApiProperty()
  @Column({ nullable: true, type: 'float' })
  lat: number;

  @ApiProperty()
  @Column({ nullable: true, type: 'float' })
  lon: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
