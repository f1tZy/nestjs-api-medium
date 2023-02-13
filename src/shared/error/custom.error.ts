import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomError extends HttpException {
  constructor(props: Record<string, string[] | string>) {
    super(
      {
        errors: Object.keys(props).reduce((acc, key) => {
          if (!acc[key]) {
            acc[key] = [props[key]];
          } else {
            acc[key].push(props[key]);
          }
          return acc;
        }, {}),
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
