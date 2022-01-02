import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @Transform((value) => {
    console.log(value.value);
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
  @IsString()
  categoryId: string;
}
