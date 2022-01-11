import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

class sendPasswordCodeDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

class verifyPasswordCodeDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  code: string;
}

class verifyCodeDto {
  @ApiProperty()
  @IsString()
  code: string;
}

export { sendPasswordCodeDto, verifyCodeDto, verifyPasswordCodeDto };
