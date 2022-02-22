import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { CategoryModule } from 'src/category/category.module';
import { TaskModule } from 'src/task/task.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [CategoryModule, TaskModule, UserModule, AuthModule, FirebaseModule],
  providers: [SyncService],
  controllers: [SyncController],
})
export class SyncModule {}
