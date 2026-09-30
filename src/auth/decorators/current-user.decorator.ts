import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayloadModel } from '../types/user.model';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayloadModel => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
