import { JobStatus } from "@prisma/client";
import { Expose, Type } from "class-transformer";
import { UserEntity } from "src/user/entities/user.entity";

export class BidEntity {
  @Expose()
  id: number;

  @Expose()
  budget: string;

  @Expose()
  status: JobStatus;

  @Expose()
  jobId: number;

  @Expose()
  @Type(() => UserEntity)
  user: UserEntity;

  constructor(partial: Partial<BidEntity>) {
    Object.assign(this, partial);
  }
}
