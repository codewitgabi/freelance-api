import { Transform, Expose } from "class-transformer";
import { Decimal } from "@prisma/client/runtime/library";

export class WalletEntity {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ value }) => (value as Decimal).toString())
  balance: string;

  @Expose()
  userId: number;

  constructor(partial: Partial<WalletEntity>) {
    Object.assign(this, partial);
  }
}
