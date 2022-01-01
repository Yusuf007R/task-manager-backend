import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { GetUserId } from 'src/user/decorator/get-user-id.decorator';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { User } from 'src/user/entity/user.entity';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FilterQueryDto } from './dto/filter-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoryService.create(createCategoryDto, user);
  }

  @Get()
  findAll(@Query() queries: FilterQueryDto, @GetUserId() userId: string) {
    return this.categoryService.findAll(queries, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUserId() userId: string) {
    return this.categoryService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUserId() userId: string,
  ) {
    return this.categoryService.update(id, updateCategoryDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUserId() userId: string) {
    return this.categoryService.remove(id, userId);
  }
}
