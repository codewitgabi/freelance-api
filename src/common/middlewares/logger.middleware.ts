/* eslint-disable */

import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

interface RequestLog {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent: string;
  ip: string;
  referer?: string;
  contentLength?: number;
  requestId: string;
  userId?: string;
  query?: any;
  body?: any;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const requestId = this.generateRequestId();

    // Add request ID to request object for potential use in controllers
    req["requestId"] = requestId;

    // Get IP address (handles proxy scenarios)
    const ip = this.getClientIp(req);

    // Log incoming request
    this.logRequest(req, requestId, ip);

    // Override res.end to capture response details
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any, cb?: any) {
      const responseTime = Date.now() - start;

      // Create log entry
      const logEntry: RequestLog = {
        timestamp: new Date().toISOString() as string,
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        responseTime,
        userAgent: req.get("User-Agent") || "Unknown",
        ip,
        referer: req.get("Referer"),
        contentLength: parseInt(res.get("Content-Length") || "0", 10),
        requestId,
        userId: req["user"]?.id || req["userId"], // Assumes user info is attached to request
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        body:
          req.method !== "GET" && req.body
            ? this.sanitizeBody(req.body)
            : undefined,
      };

      // Log the response
      this.logResponse(logEntry);

      // Call original end method
      originalEnd.call(res, chunk, encoding, cb);
    }.bind(this);

    next();
  }

  private logRequest(req: Request, requestId: string, ip: string): void {
    const { method, originalUrl, url } = req;
    const userAgent = req.get("User-Agent") || "Unknown";

    this.logger.log(
      `[${requestId}] ${method} ${originalUrl || url} - ${ip} - ${userAgent}`,
    );
  }

  private logResponse(logEntry: RequestLog): void {
    const {
      requestId,
      method,
      url,
      statusCode,
      responseTime,
      ip,
      contentLength,
    } = logEntry;

    const statusColor = this.getStatusColor(statusCode);
    const sizeStr = contentLength ? ` - ${contentLength} bytes` : "";

    this.logger.log(
      `[${requestId}] ${method} ${url} ${statusColor}${statusCode}\x1b[0m ${responseTime}ms - ${ip}${sizeStr}`,
    );

    // Log detailed information in debug mode or for errors
    if (statusCode >= 400 || process.env.LOG_LEVEL === "debug") {
      this.logger.debug(JSON.stringify(logEntry, null, 2));
    }

    // Log errors and warnings
    if (statusCode >= 500) {
      this.logger.error(`Server Error: ${statusCode} - ${method} ${url}`);
    } else if (statusCode >= 400) {
      this.logger.warn(`Client Error: ${statusCode} - ${method} ${url}`);
    }
  }

  private getClientIp(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
      req.get("X-Real-IP") ||
      req.get("X-Client-IP") ||
      "unknown"
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStatusColor(statusCode: number): string {
    if (statusCode >= 500) return "\x1b[31m"; // Red
    if (statusCode >= 400) return "\x1b[33m"; // Yellow
    if (statusCode >= 300) return "\x1b[36m"; // Cyan
    if (statusCode >= 200) return "\x1b[32m"; // Green
    return "\x1b[0m"; // Reset
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
    ];
    const sanitized = { ...body };

    // Recursively sanitize nested objects
    const sanitizeObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeObject(item));
      }

      if (obj && typeof obj === "object") {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (
            sensitiveFields.some((field) => key.toLowerCase().includes(field))
          ) {
            result[key] = "[REDACTED]";
          } else {
            result[key] = sanitizeObject(value);
          }
        }
        return result;
      }

      return obj;
    };

    return sanitizeObject(sanitized);
  }
}
