import { Controller, Get, Body, Patch, Param, Delete } from "@nestjs/common";
import { BidService } from "./bid.service";
import { UpdateBidDto } from "./dto/update-bid.dto";

@Controller("bids")
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.bidService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateBidDto: UpdateBidDto) {
    return this.bidService.update(+id, updateBidDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.bidService.remove(+id);
  }
}
