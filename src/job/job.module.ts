import { Module } from "@nestjs/common";
import { JobService } from "./job.service";
import { JobController } from "./job.controller";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory/casl-ability.factory";

@Module({
  imports: [],
  controllers: [JobController],
  providers: [JobService, CaslAbilityFactory],
})
export class JobModule {}
