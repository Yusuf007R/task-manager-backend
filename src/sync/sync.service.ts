import { ConflictException, Injectable } from '@nestjs/common';
import { CategoryService } from 'src/category/category.service';
import { Category } from 'src/category/entity/category.entity';
import { Task } from 'src/task/entity/task.entity';
import { TaskService } from 'src/task/task.service';
import { User } from 'src/user/entity/user.entity';
import { SyncCategoryDto } from './dto/sync-categorie.dto';
import { SyncTaskDto } from './dto/sync-task.dto';

@Injectable()
export class SyncService {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly taskService: TaskService,
  ) {}

  async syncCategories(createCategoryDtos: SyncCategoryDto[], user: User) {
    const categories: Category[] = [];

    for (const categoryDto of createCategoryDtos) {
      const category = await this.categoryService.findOne(
        categoryDto.id,
        undefined,
        true,
        true,
      );
      if (!category) {
        console.log('creating category');
        categories.push(await this.categoryService.create(categoryDto, user));
        continue;
      }
      if (category.userId !== user.id) {
        console.log('category.userId !== user.id');
        throw new ConflictException(`duplicated id:${category.id}`);
      }

      if (categoryDto.createdAt != category.createdAt) {
        console.log('createdAt > updatedAt');
        throw new ConflictException(`duplicated id:${category.id}`);
      }

      if (categoryDto.createdAt > category.updatedAt) {
        console.log('createdAt > updatedAt');
        throw new ConflictException(`duplicated id:${category.id}`);
      }

      if (categoryDto.deletedAt) {
        if (categoryDto.deletedAt > category.updatedAt) {
          console.log('deleting category');
          categories.push(
            await this.categoryService.syncUpdate(
              category.id,
              categoryDto,
              user.id,
            ),
          );
          continue;
        }
        console.log('categoryDto.deletedAt < category.updatedAt');
        categories.push(category);
        continue;
      }

      if (category.deletedAt) {
        if (categoryDto.updatedAt > category.deletedAt) {
          console.log('undeleting category');
          categories.push(
            await this.categoryService.syncUpdate(
              categoryDto.id,
              categoryDto,
              user.id,
              true,
            ),
          );
          continue;
        }
        console.log('category is deleted');
        categories.push(category);
        continue;
      }

      if (categoryDto.updatedAt >= category.updatedAt) {
        console.log('updated is more recent');
        categories.push(
          await this.categoryService.syncUpdate(
            categoryDto.id,
            categoryDto,
            user.id,
          ),
        );
        continue;
      }

      if (categoryDto.updatedAt < category.updatedAt) {
        console.log('updated at is older');
        categories.push(category);
        continue;
      }

      throw new ConflictException(`unknown conflict: ${category.id}`);
    }
    return categories;
  }

  async syncTask(createTaskDto: SyncTaskDto[], user: User) {
    const tasks: Task[] = [];

    for (const taskDto of createTaskDto) {
      const task = await this.taskService.findOne(
        taskDto.id,
        true,
        undefined,
        true,
        true,
      );

      if (!task) {
        console.log('creating task');
        tasks.push(await this.taskService.create(taskDto, user));
        continue;
      }
      if (task.userId !== user.id) {
        console.log('task.userId !== user.id');
        throw new ConflictException(`duplicated id:${task.id}`);
      }

      if (taskDto.createdAt > task.updatedAt) {
        console.log('createdAt > updatedAt');
        throw new ConflictException(`duplicated id:${task.id}`);
      }

      if (taskDto.deletedAt) {
        if (taskDto.deletedAt > task.updatedAt) {
          console.log('deleting taks');

          tasks.push(
            await this.taskService.syncUpdate(task.id, taskDto, user.id),
          );
          continue;
        }
        console.log('taskDto.deletedAt < task.updatedAt');
        tasks.push(task);
        continue;
      }

      if (task.deletedAt) {
        if (taskDto.updatedAt > task.deletedAt) {
          console.log('undeleting task');
          tasks.push(
            await this.taskService.syncUpdate(
              taskDto.id,
              taskDto,
              user.id,
              true,
            ),
          );
          continue;
        }
        console.log('task is deleted');
        tasks.push(task);
        continue;
      }

      if (taskDto.updatedAt >= task.updatedAt) {
        console.log('updated is more recent');
        tasks.push(
          await this.taskService.syncUpdate(taskDto.id, taskDto, user.id),
        );
        continue;
      }

      if (taskDto.updatedAt < task.updatedAt) {
        console.log('updated at is older');
        tasks.push(task);
        continue;
      }

      throw new ConflictException(`unknown conflict:${task.id}`);
    }
    return tasks;
  }

  async uploadSyncTask(date: Date, user: User) {
    return await this.taskService.syncFind(date, user.id);
  }

  async uploadSyncCategory(date: Date, user: User) {
    return await this.categoryService.syncFind(date, user.id);
  }
}
