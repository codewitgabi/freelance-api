import { IsNumber, IsPositive, IsString, IsOptional } from "class-validator";

export class CreateBidDto {
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: "Budget must be a valid decimal" },
  )
  @IsPositive({ message: "Budget must be greater than zero" })
  budget: number;

  @IsOptional()
  @IsString()
  description: string;
}
