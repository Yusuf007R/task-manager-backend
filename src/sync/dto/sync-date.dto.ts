import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class SyncDateDto {
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date: Date;
}
