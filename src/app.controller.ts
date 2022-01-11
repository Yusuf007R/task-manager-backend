import { Controller, Get } from '@nestjs/common';
import { SetPublic } from './auth/decorator/set-public.decorator';

@Controller()
export class AppController {
  @SetPublic()
  @Get()
  async initialRoute() {
    return 'Hello World!';
  }
}
