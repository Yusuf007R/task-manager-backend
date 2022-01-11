import { IsEmail, IsString } from 'class-validator';

class sendPasswordCodeDto {
  @IsEmail()
  email: string;
}

class verifyPasswordCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}

class verifyCodeDto {
  @IsString()
  code: string;
}

export { sendPasswordCodeDto, verifyCodeDto, verifyPasswordCodeDto };
