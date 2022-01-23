import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SyncTaskDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @Transform((value) => {
    if (value.value == undefined) return false;
    return value.value;
  })
  @Expose()
  isCompleted: boolean;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  deletedAt: Date;
}
