import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ParamUUID {
  @ApiProperty()
  @IsUUID()
  id: string;
}
