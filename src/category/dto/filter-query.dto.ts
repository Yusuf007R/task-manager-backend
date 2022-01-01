import { Expose, Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import IncompatableWith from 'src/helper/class-validator/incompatible-with.decorator';

export const orderDirection = ['ASC', 'DESC', 'asc', 'desc'] as const;
export type orderDirectionTypes = typeof orderDirection[number];

export const dateType = ['createdAt', 'updatedAt'] as const;
export type dateTypeTypes = typeof dateType[number];

const orderByArray = ['name', 'color', 'createdAt', 'updatedAt'] as const;
export type orderByTypes = typeof orderByArray[number];

export class FilterQueryDto {
  @IsIn(orderByArray)
  @IsString()
  @ValidateIf((o: FilterQueryDto) => o.orderDirection != undefined)
  orderBy: string;

  @IsIn(orderDirection)
  @IsString()
  @Transform((value) => {
    if (value.obj.orderBy != undefined && value.value == undefined)
      return 'ASC';
    return value.value?.toUpperCase();
  })
  @ValidateIf((o: FilterQueryDto) => o.orderBy != undefined)
  orderDirection: string;

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
      o.startDate != undefined || o.endDate != undefined || o.date != undefined,
  )
  @Expose()
  @Transform((value) => {
    if (
      (value.obj.startDate != undefined ||
        value.obj.endDate != undefined ||
        value.obj.date != undefined) &&
      value.value == undefined
    )
      return 'createdAt';
    return value.value;
  })
  dateType: string;

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
