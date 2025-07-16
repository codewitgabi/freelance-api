import { Exclude, Expose, Type } from "class-transformer";
import { Bid, Role, Transaction } from "@prisma/client";
import { WalletEntity } from "./wallet.entity";

export class UserEntity {
  @Expose()
  id: number;

  @Expose()
  firstName: string | null;

  @Expose()
  lastName: string | null;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  createdAt: Date;

  @Expose()
  banned: boolean;

  @Expose()
  role: Role;

  @Expose()
  bids: Bid[];

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Expose()
  @Type(() => WalletEntity)
  wallet: WalletEntity;

  @Exclude()
  password: string;

  @Expose()
  transactions: Transaction[];

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
