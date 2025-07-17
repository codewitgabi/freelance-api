import { IsNumber, IsPositive } from "class-validator";

export class CreateBidDto {
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: "Budget must be a valid decimal" },
  )
  @IsPositive({ message: "Budget must be greater than zero" })
  budget: number;
}
