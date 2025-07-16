import { Injectable, NotFoundException } from "@nestjs/common";
// import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { plainToInstance } from "class-transformer";
import { UserEntity } from "./entities/user.entity";
// import { $Enums } from "@prisma/client";
// import { Decimal } from "@prisma/client/runtime/library";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    // Get user matching the given id

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        bids: true,
        transactions: true,
        wallet: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    console.log({ user });
    console.log(
      "Raw wallet balance:",
      user.wallet?.balance.toFixed(2),
      typeof user.wallet?.balance.toFixed(2),
    );

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

    return serializedUser;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
