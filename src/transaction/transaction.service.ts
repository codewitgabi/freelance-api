import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreditWalletDto } from "./entities/credit-wallet.dto";
import { User } from "@prisma/client";

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name, {
    timestamp: true,
  });

  constructor(private prisma: PrismaService) {}

  async transfer(creditWalletDto: CreditWalletDto, user: User) {
    const { userId, amount } = creditWalletDto;

    this.logger.log("Begin wallet transfer", { payload: creditWalletDto });
    this.logger.log("Starting transaction for transfer");

    const transaction = await this.prisma.$transaction(async (tx) => {
      // Subtract amount from current user

      this.logger.log("Retrieving current user wallet");

      const fromUser = await tx.user.findUnique({
        where: { id: user.id },
        include: { wallet: true },
      });

      if (!fromUser) {
        // ! PROBABLY A NEVER SITUATION SINCE USER IS AUTHENTICATED
        // ! CHECK IS NEEDED SO WE DON'T HAVE TO DEAL WITH TYPESCRIPT ERRORS OF UNDEFINED

        this.logger.error("Current user does not exist");

        throw new BadRequestException("User does not exist");
      }

      // Check if user balance is enough to perform transaction

      this.logger.log("Getting current user account balance");

      const currentBalance = fromUser.wallet.balance.toNumber();

      this.logger.log("Current balance retrieved", { currentBalance });

      if (currentBalance < amount) {
        this.logger.error("Current user has an insufficient balance");

        throw new BadRequestException("Insufficient balance");
      }

      const newBalance = currentBalance - amount;

      this.logger.log("Updating current user wallet balance");

      await tx.wallet.update({
        where: { id: user.walletId },
        data: {
          balance: newBalance,
        },
      });

      this.logger.log("Current user wallet balance updated successfully");

      // Check if destination user exists

      this.logger.log("Checking if destination user account exist");

      const destUser = await tx.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      });

      if (!destUser) {
        this.logger.error("Destination user does not exist");

        throw new BadRequestException("User to transfer money to not found");
      }

      this.logger.log("Destination user account exists");

      // Add amount to destination user

      this.logger.log("Updating destination user wallet balance");

      await tx.wallet.update({
        where: { id: destUser.walletId },
        data: {
          balance: amount + destUser.wallet.balance.toNumber(),
        },
      });

      this.logger.log("Destination user wallet updated successfully");

      // Create transaction for fromUser

      this.logger.log("Saving transaction for current user");

      const transaction = await tx.transaction.create({
        data: {
          amount,
          userId: fromUser?.id,
          type: "debit",
        },
      });

      this.logger.log("Transaction for current user saved successfully");

      // Create transaction for destUser

      this.logger.log("Saving transaction for destination user");

      await tx.transaction.create({
        data: {
          amount,
          userId: destUser.id,
          type: "credit",
        },
      });

      this.logger.log("Transaction for destination user saved successfully");

      return transaction;
    });

    this.logger.log("Transaction successful");

    return transaction;
  }
}
