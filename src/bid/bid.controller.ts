import {
  Controller,
  Param,
  Patch,
  UseGuards,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { Role, User } from "@prisma/client";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuthGuard } from "src/common/guards/auth.guard";
import { BidService } from "./bid.service";
import { UpdateBidDto } from "./dto/update-bid.dto";
import SuccessResponse from "src/common/responses/success-response";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/role.decorator";
import { AcceptOrDeclineBidDto } from "./dto/accept-or-decline-bid.dto";

@Controller("bids")
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @UseGuards(AuthGuard)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @CurrentUser() user: User,
    @Body() updateBidDto: UpdateBidDto,
  ) {
    const data = await this.bidService.update(+id, updateBidDto, user);

    return SuccessResponse({ message: "Bid updated successfully", data });
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.freelancer)
  @Delete(":id")
  async delete(@Param("id") id: string, @CurrentUser() user: User) {
    await this.bidService.delete(+id, user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.client)
  @Post(":id/accept-or-reject")
  async acceptOrDeclineBid(
    @Param("id") id: string,
    @CurrentUser() user: User,
    @Body() acceptOrDeclineBidDto: AcceptOrDeclineBidDto,
  ) {
    await this.bidService.acceptOrDeclineBid(+id, user, acceptOrDeclineBidDto);
  }
}
