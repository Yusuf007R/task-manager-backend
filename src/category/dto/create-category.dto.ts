import { IsInt, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsInt()
  color: number;
}
