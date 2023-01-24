import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { ExpressRequestInterface } from '@app/types/express-request.interface';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserType } from '@app/user/types/user.type';
import { UserService } from '@app/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }

    try {
      const token = req.headers.authorization.split(' ')[1];
      const decodeUser: UserType = verify(token, JWT_SECRET);
      req.user = await this.userService.findUserById(decodeUser.id);
    } catch (err) {
      req.user = null;
    }
    next();
  }
}
