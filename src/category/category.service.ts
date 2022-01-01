import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HelperService } from 'src/helper/helper.service';
import { User } from 'src/user/entity/user.entity';
import { Between, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FilterQueryDto } from './dto/filter-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entity/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private helperService: HelperService,
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
    const skip = (queries.page - 1) * queries.limit || undefined;

    const take = queries.limit || undefined;

    const order = queries.orderBy &&
      queries.orderDirection && {
        [`category.${queries.orderBy}`]: queries.orderDirection,
      };

    const query = this.categoryRepository
      .createQueryBuilder('category')
      .skip(skip)
      .take(take)
      .orderBy(order)
      .andWhere('category.userId = :userId', { userId });
    if (queries.endDate && queries.startDate)
      query.andWhere({
        [queries.dateType]: Between(queries.startDate, queries.endDate),
      });
    if (queries.date) {
      const { dateMin, dateMax } = this.helperService.getMaxAndMinTimeOfDate(
        queries.date,
      );
      query.andWhere({ [queries.dateType]: Between(dateMin, dateMax) });
    }
    if (queries.search) {
      query.andWhere('category.name ILIKE :titleQuery', {
        titleQuery: `%${queries.search}%`,
      });
    }

    return await query.getManyAndCount();
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
