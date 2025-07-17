import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { AuthGuard } from "src/common/guards/auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { User } from "@prisma/client";
import { CreditWalletDto } from "./entities/credit-wallet.dto";
import SuccessResponse from "src/common/responses/success-response";

@Controller("transactions")
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post("transfer")
  async transfer(
    @CurrentUser() user: User,
    @Body() creditWalletDto: CreditWalletDto,
  ) {
    const data = await this.transactionService.transfer(creditWalletDto, user);

    return SuccessResponse({ message: "Transfer successful", data });
  }
}
