import { IsIn } from "class-validator";

export class AcceptOrDeclineBidDto {
  @IsIn(["accept", "reject"])
  action: string;
}
