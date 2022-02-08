import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsOptional, ValidateNested } from 'class-validator';
import { SyncCategoryDto } from './sync-categorie.dto';
import { SyncTaskDto } from './sync-task.dto';

export class SyncDto {
  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  lastSync: Date;

  @ApiProperty({ type: () => SyncTaskDto })
  @IsArray()
  @IsOptional()
  @Type(() => SyncTaskDto)
  @ValidateNested({ each: true })
  tasks: SyncTaskDto[];

  @ApiProperty({ type: () => SyncCategoryDto })
  @IsArray()
  @IsOptional()
  @Type(() => SyncCategoryDto)
  @ValidateNested({ each: true })
  categories: SyncCategoryDto[];
}
