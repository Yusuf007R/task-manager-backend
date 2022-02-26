import { ApiProperty } from '@nestjs/swagger';

export class AccessRefreshResponseDto {
  @ApiProperty()
  refreshToken: string;
  @ApiProperty()
  accessToken: string;
}

export class AccessResponseDto {
  @ApiProperty()
  accessToken: string;
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;
}
