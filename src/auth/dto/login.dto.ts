import { IsEmail, IsString } from 'class-validator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export default LoginDto;
