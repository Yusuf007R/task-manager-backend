import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetJwt = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tokenHeader = request.headers.authorization;
    return tokenHeader.replace('Bearer ', '');
  },
);
