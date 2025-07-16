import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  MongoAbility,
  MongoQuery,
} from "@casl/ability";

import { Job, User, Transaction } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { Action } from "src/common/enums/actions.enum";

// Define all possible subjects
type Subjects =
  | "Job"
  | "Transaction"
  | "User"
  | "all"
  | User
  | Job
  | Transaction;

export type AppAbility = MongoAbility<[Action, Subjects], MongoQuery>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    // Basic permissions for all authenticated users

    if (user) {
      // Job permissions

      console.log("There is a user");

      can(Action.Read, "Job"); // Can read all jobs
      can(Action.Create, "Job"); // Can create jobs
      can([Action.Update, Action.Delete], "Job", { userId: user.id }); // Can only update/delete own jobs

      // User permissions

      can(Action.Update, "User", { id: user.id }); // Can update own profile
      can(Action.Delete, "User", { id: user.id }); // Can delete own profile
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as unknown as ExtractSubjectType<Subjects>,
    });
  }
}
