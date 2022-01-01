import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetshowCategory = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const param = request.query.showCategory;
    if (param === 'true') return true;
    if (param === 'false') return false;
    return false;
  },
);
