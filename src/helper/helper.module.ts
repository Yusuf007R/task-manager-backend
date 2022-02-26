import { Global, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { HelperService } from './helper.service';

@Global()
@Module({
  providers: [HelperService, AuthModule],
  exports: [HelperService],
})
export class HelperModule {}
