import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import {
  ValidationPipe as BaseValidationPipe,
  ValidationError,
} from "@nestjs/common";

@Injectable()
export class ValidationPipe extends BaseValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = {};

        errors.forEach((error) => {
          if (error.constraints) {
            formattedErrors[error.property] = Object.values(error.constraints);
          }
        });

        return new UnprocessableEntityException({
          message: "Validation failed",
          errors: formattedErrors,
        });
      },
    });
  }
}
