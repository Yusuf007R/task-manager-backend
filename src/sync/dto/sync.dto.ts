import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, ValidateNested } from 'class-validator';
import { SyncCategoryDto } from './sync-categorie.dto';
import { SyncTaskDto } from './sync-task.dto';

export class SyncDto {
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  lastSync: Date;

  @ApiProperty({ type: () => SyncTaskDto })
  @IsArray()
  @Type(() => SyncTaskDto)
  @ValidateNested({ each: true })
  tasks: SyncTaskDto[];

  @ApiProperty({ type: () => SyncCategoryDto })
  @IsArray()
  @Type(() => SyncCategoryDto)
  @ValidateNested({ each: true })
  categories: SyncCategoryDto[];
}
