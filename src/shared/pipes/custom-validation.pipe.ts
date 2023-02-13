import { HttpException, HttpStatus, PipeTransform, ValidationError } from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common/interfaces/features/pipe-transform.interface';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export class CustomValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const obj = plainToInstance(metadata.metatype, value);
    const err = await validate(obj);

    if (!err.length) {
      return value;
    }

    throw new HttpException({ errors: this.formatError(err) }, HttpStatus.UNPROCESSABLE_ENTITY);
  }

  formatError(errors: ValidationError[]) {
    return errors.reduce((acc, err) => {
      acc[err.property] = Object.values(err.constraints);
      return acc;
    }, {});
  }
}
