import { ApiProperty } from '@nestjs/swagger';

export class AccessRefreshResponseDto {
  @ApiProperty()
  refresh_token: string;
  @ApiProperty()
  access_token: string;
}

export class AccessResponseDto {
  @ApiProperty()
  access_token: string;
}
