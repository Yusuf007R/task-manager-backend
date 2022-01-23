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

export class LocationResponseDto {
  @ApiProperty()
  continent: string;
  @ApiProperty()
  continentCode: string;
  @ApiProperty()
  country: string;
  @ApiProperty()
  countryCode: string;
  @ApiProperty()
  region: string;
  @ApiProperty()
  regionName: string;
  @ApiProperty()
  city: string;
  @ApiProperty()
  district: string;
  @ApiProperty()
  zip: string;
  @ApiProperty()
  lat: number;
  @ApiProperty()
  lon: number;
  @ApiProperty()
  timezone: string;
  @ApiProperty()
  isp: string;
}

export class GetActiveSessionDto {
  @ApiProperty()
  ip: string;

  @ApiProperty()
  sessionId: number;

  @ApiProperty()
  location: LocationResponseDto;
}
