import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { GetJwt } from 'src/auth/decorator/get-jwt.decorator';
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
  async create(
    @Body() dto: SyncDto,
    @GetUser() user: User,
    @GetJwt() jwt: string,
  ) {
    if (dto.categories)
      await this.syncService.syncCategories(dto.categories, user);
    if (dto.tasks) await this.syncService.syncTask(dto.tasks, user);
    const date = dto.lastSync || new Date(0);
    if (dto.tasks || dto.categories)
      await this.syncService.sendNewDataNotify(jwt, user);
    return {
      tasks: await this.syncService.uploadSyncTask(date, user),
      categories: await this.syncService.uploadSyncCategory(date, user),
    };
  }
}
