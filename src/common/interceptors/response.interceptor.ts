import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Response } from "express";

interface StandardResponse<T = unknown> {
  message?: string;
  data?: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, object> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<object> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((originalData) => {
        let message = "Request successful";
        let data: unknown = originalData;

        // If originalData matches the StandardResponse shape, extract message/data

        if (
          typeof originalData === "object" &&
          originalData !== null &&
          "message" in originalData &&
          "data" in originalData
        ) {
          const casted = originalData as StandardResponse;
          message = casted.message ?? message;
          data = casted.data;
        }

        return {
          status: "success",
          statusCode: response.statusCode,
          message,
          data,
        };
      }),
    );
  }
}
