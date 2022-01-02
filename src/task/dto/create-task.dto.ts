import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsBoolean()
  isCompleted: boolean;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsOptional()
  @IsString()
  categoryId: string;
}
