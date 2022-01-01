import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryService } from 'src/category/category.service';
import { HelperService } from 'src/helper/helper.service';
import { User } from 'src/user/entity/user.entity';
import { Repository, Between, Brackets } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterQueryDto } from './dto/filter-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entity/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private categoryService: CategoryService,
    private helperService: HelperService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User) {
    const task = this.taskRepository.create(createTaskDto);
    task.user = user;
    if (createTaskDto.categoryId) {
      const category = await this.categoryService.findOne(
        createTaskDto.categoryId,
        user.id,
      );
      if (category) task.category = category;
    }
    return await this.taskRepository.save(task);
  }

  async findAll(queries: FilterQueryDto, userId: string) {
    const [tasks, total] = await this.findAllQuery(queries, userId);
    if (queries.page && queries.limit) {
      return {
        data: tasks,
        metaData: {
          total,
          pageCount: Math.ceil(total / queries.limit),
          page: queries.page,
          limit: queries.limit,
        },
      };
    }
    return tasks;
  }

  async findAllQuery(queries: FilterQueryDto, userId: string) {
    const skip = (queries.page - 1) * queries.limit || undefined;

    const take = queries.limit || undefined;

    const order = queries.orderBy &&
      queries.orderDirection && {
        [`task.${queries.orderBy}`]: queries.orderDirection,
      };

    const query = this.taskRepository
      .createQueryBuilder('task')
      .skip(skip)
      .take(take)
      .orderBy(order)
      .where(
        new Brackets((qb) => {
          qb.where(
            new Brackets((qb2) => {
              qb2.where('task.userId = :userId', { userId });

              if (queries.isCompleted)
                qb2.andWhere('task.isCompleted = :isCompleted', {
                  isCompleted: queries.isCompleted,
                });

              if (queries.categoryId)
                qb2.andWhere('task.categoryId = :categoryId', {
                  categoryId: queries.categoryId,
                });

              if (queries.endDate && queries.startDate)
                qb2.andWhere({
                  [queries.dateType]: Between(
                    queries.startDate,
                    queries.endDate,
                  ),
                });

              if (queries.date) {
                const { dateMin, dateMax } =
                  this.helperService.getMaxAndMinTimeOfDate(queries.date);
                qb2.andWhere({ [queries.dateType]: Between(dateMin, dateMax) });
              }
            }),
          );
          if (queries.search) {
            qb.andWhere(
              new Brackets((qb3) => {
                qb3.where('task.title ILIKE :titleQuery', {
                  titleQuery: `%${queries.search}%`,
                });
                qb3.orWhere('task.description ILIKE :descQuery', {
                  descQuery: `%${queries.search}%`,
                });
              }),
            );
          }
        }),
      );

    if (queries.showCategory)
      query.leftJoinAndSelect('task.category', 'category');

    return await query.getManyAndCount();
  }

  async findOne(id: string, showCategory: boolean, userId: string) {
    const task = await this.taskRepository.findOne({
      where: { id, userId },
      relations: showCategory ? ['category'] : undefined,
    });
    if (!task) throw new NotFoundException('task not found');
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.taskRepository.findOne({ where: { id, userId } });
    if (!task) throw new NotFoundException('task not found');
    if (updateTaskDto.categoryId) {
      const category = await this.categoryService.findOne(
        updateTaskDto.categoryId,
        userId,
      );
      if (category) task.category = category;
    }
    if (updateTaskDto.categoryId === null) task.category = null;
    return await this.taskRepository.save({
      ...task,
      ...updateTaskDto,
    });
  }

  async remove(id: string, userId: string) {
    const task = await this.taskRepository.findOne({ where: { id, userId } });
    if (!task) throw new NotFoundException('task not found');
    return await this.taskRepository.remove(task);
  }
}
