import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let errorData: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const response = exception.getResponse();

      if (typeof response === "object" && response !== null) {
        const maybeResponse = response as {
          message?: string;
          errors?: Record<string, string[]>;
        };

        message = maybeResponse.message ?? message;

        if (maybeResponse.errors) {
          errorData = maybeResponse.errors;
        }
      } else if (typeof response === "string") {
        message = response;
      }
    }

    const body = {
      status: "error",
      statusCode,
      ...(errorData ? { errors: errorData } : { message }),
    };

    res.status(statusCode).json(body);
  }
}
