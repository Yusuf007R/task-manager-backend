import { Expose, Transform, Type } from 'class-transformer';
import {
  IsBooleanString,
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';
import IncompatableWith from 'src/helper/class-validator/incompatible-with.decorator';
import { orderDirection } from 'src/helper/dto/custom.types';

export const dateType = ['date', 'createdAt', 'updatedAt'] as const;
export type dateTypeTypes = typeof dateType[number];

const orderByArray = [
  'date',
  'title',
  'description',
  'isCompleted',
  'createdAt',
  'updatedAt',
] as const;
export type orderByTypes = typeof orderByArray[number];

export class FilterQueryDto {
  @IsUUID()
  @IsOptional()
  categoryId: string;

  @IsString()
  @IsOptional()
  search: string;

  @IncompatableWith(['date'])
  @ValidateIf((o: FilterQueryDto) => o.endDate != undefined)
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IncompatableWith(['date'])
  @ValidateIf((o: FilterQueryDto) => o.startDate != undefined)
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsDate()
  @IncompatableWith(['startDate', 'endDate'])
  @Type(() => Date)
  @IsOptional()
  date: Date;

  @IsIn(dateType)
  @IsString()
  @ValidateIf(
    (o: FilterQueryDto) =>
      o.date != undefined || o.startDate != undefined || o.endDate != undefined,
  )
  @Expose()
  @Transform((value) => {
    if (
      (value.obj.date != undefined ||
        value.obj.startDate != undefined ||
        value.obj.endDate != undefined) &&
      value.value == undefined
    )
      return 'date';
    return value.value;
  })
  dateType: string;

  @IsIn(orderByArray)
  @IsString()
  @ValidateIf((o: FilterQueryDto) => o.orderDirection != undefined)
  orderBy: 'title' | 'description' | 'isCompleted' | 'createdAt' | 'updatedAt';

  @IsIn(orderDirection)
  @IsString()
  @Transform((value) => {
    if (value.obj.orderBy != undefined && value.value == undefined)
      return 'ASC';
    return value.value?.toUpperCase();
  })
  @Expose()
  @ValidateIf((o: FilterQueryDto) => o.orderBy != undefined)
  orderDirection: 'ASC' | 'DESC';

  @IsBooleanString()
  @IsOptional()
  isCompleted: boolean;

  @IsBooleanString()
  @IsOptional()
  showCategory: boolean;

  @ValidateIf((o: FilterQueryDto) => o.limit != undefined)
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number;

  @ValidateIf((o: FilterQueryDto) => o.page != undefined)
  @IsInt()
  @Min(1)
  @Transform((value) => {
    if (value.obj.page != undefined && value.value == undefined) return 10;
    return value.value;
  })
  @Expose()
  @Type(() => Number)
  limit: number;
}
