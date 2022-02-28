import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

class changeForgotPasswordDto {
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

class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @Matches('(?=.*[a-z])', undefined, {
    message: 'newPassword must contain at least one lowercase letter',
  })
  @Matches('(?=.*[A-Z])', undefined, {
    message: 'newPassword must contain at least one uppercase letter',
  })
  @Matches('(?=.*[0-9])', undefined, {
    message: 'newPassword must contain at least one digit',
  })
  @MinLength(8)
  @MaxLength(24)
  @IsString()
  newPassword: string;
}

export { changeForgotPasswordDto, ChangePasswordDto };
