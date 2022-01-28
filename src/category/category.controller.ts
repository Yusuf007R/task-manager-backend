import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ParamUUID } from 'src/helper/dto/param-uuid.dto';
import { GetUserId } from 'src/user/decorator/get-user-id.decorator';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { User } from 'src/user/entity/user.entity';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FilterQueryDto } from './dto/filter-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entity/category.entity';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiResponse({ type: Category })
  @Post()
  @HttpCode(201)
  create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoryService.create(createCategoryDto, user);
  }

  @ApiResponse({ type: [Category] })
  @Get()
  findAll(@Query() queries: FilterQueryDto, @GetUserId() userId: string) {
    return this.categoryService.findAll(queries, userId);
  }

  @ApiResponse({ type: Category })
  @Get(':id')
  async findOne(@Param() param: ParamUUID, @GetUserId() userId: string) {
    const category = await this.categoryService.findOne(param.id, userId);
    if (!category) throw new NotFoundException(`category not found`);
    return category;
  }

  @ApiResponse({ type: Category })
  @Patch(':id')
  update(
    @Param() param: ParamUUID,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUserId() userId: string,
  ) {
    return this.categoryService.update(param.id, updateCategoryDto, userId);
  }

  @ApiResponse({ type: Category })
  @Delete(':id')
  remove(@Param() param: ParamUUID, @GetUserId() userId: string) {
    return this.categoryService.remove(param.id, userId);
  }
}
