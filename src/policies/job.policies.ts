import { AppAbility } from "src/casl/casl-ability.factory/casl-ability.factory";
import { Action } from "../common/enums/actions.enum";
import { Job } from "@prisma/client";

export class ReadJobPolicyHandler {
  handle(ability: AppAbility) {
    console.log("Read job policy handler");
    return ability.can(Action.Read, "Job");
  }
}

export class CreateJobPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Create, "Job");
  }
}

export class UpdateJobPolicyHandler {
  constructor(private job: Job) {}

  handle(ability: AppAbility) {
    return ability.can(Action.Update, this.job);
  }
}

export class DeleteJobPolicyHandler {
  constructor(private job: Job) {}

  handle(ability: AppAbility) {
    return ability.can(Action.Delete, this.job);
  }
}
