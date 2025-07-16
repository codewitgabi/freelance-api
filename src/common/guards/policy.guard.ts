import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory/casl-ability.factory";
import { PolicyHandler } from "../casl-policy.handler";
import { CHECK_POLICIES_KEY } from "../decorators/policy.decorator";
import { Request } from "express";

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    // If no policies are defined, allow access
    if (policyHandlers.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const { user } = request;

    console.log(user);

    // If no user is present, deny access

    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    console.log("Activated...");

    // Ensure user object matches the User type expected by createForUser

    const ability = this.caslAbilityFactory.createForUser(user);

    // Attach ability to request for use in controllers
    request.ability = ability;

    const hasPermission = policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );

    if (!hasPermission) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }

  private execPolicyHandler(
    handler: PolicyHandler,
    ability: ReturnType<CaslAbilityFactory["createForUser"]>, // Use the actual return type
  ): boolean {
    if (typeof handler === "function") {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
