import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryService } from 'src/category/category.service';
import { User } from 'src/user/entity/user.entity';
import { FindManyOptions, FindOneOptions, Repository, Between } from 'typeorm';
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
    const where: FindOneOptions<Task>['where'] = { userId };

    if (queries.categoryId) where.categoryId = queries.categoryId;

    if (queries.isCompleted) where.isCompleted = queries.isCompleted;

    if (queries.endDate && queries.startDate)
      where[queries.dateType] = Between(queries.startDate, queries.endDate);

    if (queries.date) {
      const minDate = new Date(queries.date);
      minDate.setUTCHours(0, 0, 0, 0);
      const maxDate = new Date(minDate);
      maxDate.setUTCHours(23, 59, 59, 999);
      where[queries.dateType] = Between(minDate, maxDate);
    }

    const relations: FindOneOptions<Task>['relations'] =
      queries.showCategory && ['category'];

    const skip: FindManyOptions<Task>['skip'] =
      (queries.page - 1) * queries.limit || undefined;

    const take: FindManyOptions<Task>['take'] = queries.limit || undefined;

    const order: FindOneOptions<Task>['order'] = queries.orderBy &&
      queries.orderDirection && {
        [queries.orderBy]: queries.orderDirection,
      };

    return await this.taskRepository.findAndCount({
      where,
      relations,
      skip,
      take,
      order,
    });
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
