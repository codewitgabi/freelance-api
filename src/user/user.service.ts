import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { plainToInstance } from "class-transformer";
import { UserEntity } from "./entities/user.entity";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name, { timestamp: true });

  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    this.logger.log("Checking if there is a user with the specified id", {
      id,
    });
    // Get user matching the given id

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        bids: true,
        transactions: true,
        wallet: true,
      },
    });

    this.logger.log("Check completed");

    if (!user) {
      this.logger.error("User not found with given id", { id });

      throw new NotFoundException("User not found");
    }

    this.logger.log("Found user with given id", { id });

    this.logger.log("Serializing user data");

    const transformedUser = {
      ...user,
      wallet: {
        ...user.wallet,
        balance: Number(user.wallet.balance),
      },
    };

    const serializedUser = plainToInstance(UserEntity, transformedUser, {
      excludeExtraneousValues: true,
    });

    this.logger.log("User serialization completed");

    return serializedUser;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
