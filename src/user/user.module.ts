import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TransactionService } from "src/transaction/transaction.service";

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, TransactionService],
})
export class UserModule {}
