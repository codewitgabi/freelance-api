import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { plainToInstance } from "class-transformer";
import { UserEntity } from "./entities/user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "@prisma/client";

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

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    user: User,
    profilePic?: string,
  ) {
    this.logger.log("Begin updating user profile", {
      payload: updateUserDto,
      id,
      userId: user.id,
    });

    // Check if id and user id are the same

    if (id !== user.id) {
      this.logger.error("Permission denied");

      throw new ForbiddenException("Permission denied");
    }

    this.logger.log("User has permission to update profile");

    // Check if user with id exists

    const data = { ...updateUserDto };

    if (profilePic) {
      data["profilePic"] = profilePic;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        wallet: true,
      },
    });

    this.logger.log("Serializing user data");

    const transformedUser = {
      ...updatedUser,
      wallet: {
        ...updatedUser.wallet,
        balance: Number(updatedUser.wallet.balance),
      },
    };

    const serializedUser = plainToInstance(UserEntity, transformedUser, {
      excludeExtraneousValues: true,
    });

    this.logger.log("User serialization completed");
    this.logger.log("User update process completed");

    return serializedUser;
  }

  async delete(id: number, user: User) {
    // Check if user id matches id provided

    this.logger.log("Begin deleting user account", {
      id,
      userId: user.id,
    });
    this.logger.log("Checking if user has permission to perform action");

    if (id !== user.id) {
      this.logger.error(
        "Permission denied; User does not have permission to perform this action",
      );

      throw new ForbiddenException("Permission denied");
    }

    this.logger.log("User has permission to perform action");
    this.logger.log("Permanently deleting user account");

    await this.prisma.user.delete({ where: { id } });

    this.logger.log("User deletion completed");
  }
}
