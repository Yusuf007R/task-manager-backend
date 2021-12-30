import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MinLength,
  // Matches,
  // MinLength,
} from 'class-validator';

class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsUrl()
  imageUrl: string;

  @Matches('(?=.*[a-z])', undefined, {
    message: 'password must contain at least one lowercase letter',
  })
  @Matches('(?=.*[A-Z])', undefined, {
    message: 'password must contain at least one uppercase letter',
  })
  @Matches('(?=.*[0-9])', undefined, {
    message: 'password must contain at least one digit',
  })
  @MinLength(8)
  @IsString()
  password: string;
}

export default RegisterDto;
