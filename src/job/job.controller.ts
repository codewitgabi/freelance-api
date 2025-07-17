import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { JobService } from "./job.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { Roles } from "src/common/decorators/role.decorator";
import { Role } from "@prisma/client";
import { RolesGuard } from "src/common/guards/roles.guard";
import { AuthGuard } from "src/common/guards/auth.guard";
import SuccessResponse from "src/common/responses/success-response";
import { PaginationQueryDto } from "src/common/pagination-query.dto";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory/casl-ability.factory";
import { User } from "@prisma/client";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { BidService } from "src/bid/bid.service";
import { CreateBidDto } from "src/bid/dto/create-bid.dto";

@Controller("jobs")
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly bidService: BidService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.client)
  async create(@Body() createJobDto: CreateJobDto, @CurrentUser() user: User) {
    const data = await this.jobService.create(createJobDto, user.id);

    return SuccessResponse({
      message: "Job created successfully",
      data,
    });
  }

  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    const data = await this.jobService.findAll(paginationQuery);

    return SuccessResponse({
      message: "Jobs fetched successfully",
      data,
    });
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const data = await this.jobService.findOne(+id);

    return SuccessResponse({
      message: "Job fetched successfully",
      data,
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.client)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateJobDto: UpdateJobDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.jobService.update(+id, updateJobDto, user);

    return SuccessResponse({
      message: "Job updated successfully",
      data,
    });
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.client)
  @Delete(":id")
  async delete(@Param("id") id: string, @CurrentUser() user: User) {
    await this.jobService.delete(+id, user);

    return SuccessResponse({
      message: "Job deleted successfully",
    });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.freelancer)
  @Post(":id/bids")
  async placeBid(
    @Param("id") id: string,
    @Body() createBidDto: CreateBidDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.bidService.create(createBidDto, +id, user);

    return SuccessResponse({ message: "Bid placed successfully", data });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.client, Role.admin)
  @Get(":id/bids")
  async fetchBids(@Param("id") id: string, @CurrentUser() user: User) {
    const data = await this.bidService.findAll(+id, user);

    return SuccessResponse({ message: "Bids fetched successfully", data });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.client, Role.admin)
  @Get(":id/bids/:bidId")
  async getBid(
    @Param("id") id: string,
    @Param("bidId") bidId: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.bidService.findOne(+id, +bidId, user);

    return SuccessResponse({ message: "Bids fetched successfully", data });
  }
}
