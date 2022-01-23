import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class SyncCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsInt()
  color: number;

  @ApiProperty()
  @IsUUID()
  id: string;

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
