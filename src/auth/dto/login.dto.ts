import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export default LoginDto;
