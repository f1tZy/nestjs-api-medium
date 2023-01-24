import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExpressRequestInterface } from '@app/types/express-request.interface';

export const User = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<ExpressRequestInterface>();

  if (!req.user) {
    return null;
  }

  if (data) {
    return req.user[data];
  }

  return req.user;
});
