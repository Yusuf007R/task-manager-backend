import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { SyncCategoryDto } from './sync-categorie.dto';
import { SyncTaskDto } from './sync-task.dto';

export class SyncResponseDto {
  @ApiProperty()
  @IsArray()
  @Type(() => SyncTaskDto)
  @ValidateNested({ each: true })
  tasks: SyncTaskDto[];

  @ApiProperty()
  @IsArray()
  @Type(() => SyncCategoryDto)
  @ValidateNested({ each: true })
  categories: SyncCategoryDto[];
}
