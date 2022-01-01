import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Between, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FilterQueryDto } from './dto/filter-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entity/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto, user: User) {
    const category = this.categoryRepository.create(createCategoryDto);
    category.user = user;
    return await this.categoryRepository.save(category);
  }

  async findAll(queries: FilterQueryDto, userId: string) {
    const [categories, total] = await this.findAllQuery(queries, userId);
    if (queries.page && queries.limit) {
      return {
        data: categories,
        metaData: {
          total,
          pageCount: Math.ceil(total / queries.limit),
          page: queries.page,
          limit: queries.limit,
        },
      };
    }
    return categories;
  }

  async findAllQuery(queries: FilterQueryDto, userId: string) {
    const where: FindOneOptions<Category>['where'] = { userId };

    if (queries.endDate && queries.startDate)
      where[queries.dateType] = Between(queries.startDate, queries.endDate);

    const skip: FindManyOptions<Category>['skip'] =
      (queries.page - 1) * queries.limit || undefined;

    const take: FindManyOptions<Category>['take'] = queries.limit || undefined;

    const order: FindOneOptions<Category>['order'] = queries.orderBy &&
      queries.orderDirection && {
        [queries.orderBy]: queries.orderDirection,
      };

    if (queries.date) {
      const minDate = new Date(queries.date);
      minDate.setUTCHours(0, 0, 0, 0);
      const maxDate = new Date(minDate);
      maxDate.setUTCHours(23, 59, 59, 999);
      where[queries.dateType] = Between(minDate, maxDate);
    }

    return await this.categoryRepository.findAndCount({
      where,
      skip,
      take,
      order,
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
    });
    if (!category) throw new NotFoundException('category not found');
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ) {
    const category = await this.categoryRepository.find({
      where: { id, userId },
    });
    if (!category) throw new NotFoundException('category not found');
    return await this.categoryRepository.save({
      ...category,
      ...updateCategoryDto,
    });
  }

  async remove(id: string, userId: string) {
    const category = await this.categoryRepository.find({
      where: { id, userId },
    });
    if (!category) throw new NotFoundException('category not found');
    return await this.categoryRepository.remove(category);
  }
}
