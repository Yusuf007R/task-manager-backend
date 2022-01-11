import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  // Matches,
  // MinLength,
} from 'class-validator';

class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl: string;

  @ApiProperty()
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
  @MaxLength(24)
  @IsString()
  password: string;
}

export default RegisterDto;
