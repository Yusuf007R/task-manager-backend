import {
  Body,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  Post,
} from '@nestjs/common';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { User } from 'src/user/entity/user.entity';
import { SyncCategoryDto } from './dto/sync-categorie.dto';
import { SyncDateDto } from './dto/sync-date.dto';
import { SyncTaskDto } from './dto/sync-task.dto';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('categories')
  async syncCategories(
    @Body(new ParseArrayPipe({ items: SyncCategoryDto }))
    body: SyncCategoryDto[],
    @GetUser() user: User,
  ) {
    return await this.syncService.syncCategories(body, user);
  }

  @Post('tasks')
  async syncTaks(
    @Body(new ParseArrayPipe({ items: SyncTaskDto }))
    body: SyncTaskDto[],
    @GetUser() user: User,
  ) {
    return await this.syncService.syncTask(body, user);
  }

  @Get('tasks/:date')
  async syncUploadTaks(@Param() params: SyncDateDto, @GetUser() user: User) {
    return await this.syncService.uploadSyncTask(params.date, user);
  }

  @Get('categories/:date')
  async syncUploadCategories(
    @Param() params: SyncDateDto,
    @GetUser() user: User,
  ) {
    return await this.syncService.uploadSyncCategory(params.date, user);
  }
}
