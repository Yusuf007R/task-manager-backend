import { IsString, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @Matches('^#(?:[0-9a-fA-F]{3}){1,2}$', undefined, {
    message: 'color must be in hex format',
  })
  @IsString()
  color: string;
}
