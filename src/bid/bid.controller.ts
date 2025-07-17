import { Controller, Param, Patch, UseGuards, Body } from "@nestjs/common";
import { User } from "@prisma/client";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuthGuard } from "src/common/guards/auth.guard";
import { BidService } from "./bid.service";
import { UpdateBidDto } from "./dto/update-bid.dto";
import SuccessResponse from "src/common/responses/success-response";

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
}
