import { MongoAbility, MongoQuery } from "@casl/ability";
import { User } from "@prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    ability?: MongoAbility<[string, any], MongoQuery>;
    user?: User;
  }
}
