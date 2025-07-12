import { Exclude, Type, Expose } from "class-transformer";
import { WalletEntity } from "src/user/entities/wallet.entity";

export class AuthUserEntity {
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
  @Type(() => WalletEntity)
  wallet: WalletEntity | null;

  @Exclude()
  password: string;

  constructor(partial: Partial<AuthUserEntity>) {
    Object.assign(this, partial);
  }
}
