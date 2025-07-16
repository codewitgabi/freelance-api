import { Expose, Transform } from "class-transformer";
import { Decimal } from "@prisma/client/runtime/library";

export class WalletEntity {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ value }: { value: Decimal }) => {
    console.log(value);
    return value ? value.toString() : "0.00";
  })
  balance: string;

  constructor(partial: Partial<WalletEntity>) {
    Object.assign(this, partial);
  }
}
