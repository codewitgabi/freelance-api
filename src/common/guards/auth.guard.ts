import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { jwtConstants } from "src/auth/constants";
import { PrismaService } from "src/prisma/prisma.service";
import { TUser } from "../types/user.types";

// Define the JWT payload interface

interface JwtPayload {
  sub: number;
  email: string;
}

// Extend the Request interface to include the user property

declare module "express-serve-static-core" {
  interface Request {
    user?: TUser;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const { sub } = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: jwtConstants.secret,
      });

      // Get full user detail

      const user = await this.prisma.user.findUnique({ where: { id: sub } });

      if (!user) {
        throw new UnauthorizedException();
      }

      request.user = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
