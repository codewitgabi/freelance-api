import { Exclude, Expose } from "class-transformer";

export class UserEntity {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;

  @Expose()
  get fullname() {
    return `${this.firstName} ${this.lastName}`;
  }

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
