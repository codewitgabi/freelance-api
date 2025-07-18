import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { UserService } from "./user.service";
import SuccessResponse from "src/common/responses/success-response";
import { AuthGuard } from "src/common/guards/auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { User } from "@prisma/client";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { TransactionService } from "src/transaction/transaction.service";
import { FileInterceptor } from "@nestjs/platform-express";
import "multer";
import { Express } from "express";
import { uploadToCloud } from "src/common/functions/file.upload";

@Controller("users")
@UseInterceptors(CacheInterceptor)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const data = await this.userService.findOne(+id);

    return SuccessResponse({
      message: "User profile fetched successfully",
      data,
    });
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  @UseInterceptors(FileInterceptor("profilePic"))
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let profilePic: string | undefined;

    if (file) {
      profilePic = await uploadToCloud(file);
    }

    const data = await this.userService.update(
      +id,
      updateUserDto,
      user,
      profilePic,
    );

    return SuccessResponse({ message: "Profile updated successfully", data });
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @Delete(":id")
  async delete(@Param("id") id: string, @CurrentUser() user: User) {
    await this.userService.delete(+id, user);

    return SuccessResponse({ message: "Account deleted successfully" });
  }

  @UseGuards(AuthGuard)
  @Get(":id/transactions")
  async getTransactions(@Param("id") id: string, @CurrentUser() user: User) {
    const data = await this.transactionService.findAll(+id, user);

    return SuccessResponse({
      message: "Transactions fetched successfully",
      data,
    });
  }
}
