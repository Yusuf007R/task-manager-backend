import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { CategoryModule } from 'src/category/category.module';
import { TaskModule } from 'src/task/task.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [CategoryModule, TaskModule, UserModule],
  providers: [SyncService],
  controllers: [SyncController],
})
export class SyncModule {}
