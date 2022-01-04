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
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { User } from 'src/user/entity/user.entity';
import { GetshowCategory } from './decorator/show-category.decorator';
import { FilterQueryDto } from './dto/filter-query.dto';
import { GetUserId } from 'src/user/decorator/get-user-id.decorator';
import { Task } from './entity/task.entity';
import { ApiResponse } from '@nestjs/swagger';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiResponse({ type: Task })
  @Post()
  @HttpCode(201)
  create(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User) {
    return this.taskService.create(createTaskDto, user);
  }

  @ApiResponse({ type: [Task] })
  @Get()
  findAll(@Query() queries: FilterQueryDto, @GetUserId() userId: string) {
    return this.taskService.findAll(queries, userId);
  }

  @ApiResponse({ type: Task })
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetshowCategory() showCategory: boolean,
    @GetUserId() userId: string,
  ) {
    return this.taskService.findOne(id, showCategory, userId);
  }

  @ApiResponse({ type: Task })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUserId() userId: string,
  ) {
    return this.taskService.update(id, updateTaskDto, userId);
  }

  @ApiResponse({ type: Task })
  @Delete(':id')
  remove(@Param('id') id: string, @GetUserId() userId: string) {
    return this.taskService.remove(id, userId);
  }
}
