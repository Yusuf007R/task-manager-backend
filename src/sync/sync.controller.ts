import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { User } from 'src/user/entity/user.entity';
import { SyncResponseDto } from './dto/sync-response.dto';
import { SyncDto } from './dto/sync.dto';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @ApiResponse({ type: SyncResponseDto })
  @Post()
  async create(@Body() dto: SyncDto, @GetUser() user: User) {
    await this.syncService.syncCategories(dto.categories, user);
    await this.syncService.syncTask(dto.tasks, user);
    return {
      tasks: await this.syncService.uploadSyncTask(dto.lastSync, user),
      categories: await this.syncService.uploadSyncCategory(dto.lastSync, user),
    };
  }
}
