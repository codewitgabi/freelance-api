import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreateBidDto } from "./dto/create-bid.dto";
import { UpdateBidDto } from "./dto/update-bid.dto";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class BidService {
  private readonly logger = new Logger(BidService.name);

  constructor(private prisma: PrismaService) {}

  async create(createBidDto: CreateBidDto, jobId: number, user: User) {
    this.logger.log("Beginning creating bid", {
      jobId,
      userId: user.id,
    });

    // Check if job with id exists in db

    this.logger.log("Checking if job with id exists in db");

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      this.logger.error("Job not found", { jobId });

      throw new NotFoundException("Job not found");
    }

    this.logger.log("Job for provided id retrieved successfully");

    // Create bid instance for job

    this.logger.log("Creating job", {
      jobId,
      userId: user.id,
      payload: createBidDto,
    });

    const bid = await this.prisma.bid.create({
      data: {
        ...createBidDto,
        userId: user.id,
        jobId,
      },
    });

    this.logger.log("Job creating process completed");

    return bid;
  }

  findAll() {
    return `This action returns all bid`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bid`;
  }

  update(id: number, updateBidDto: UpdateBidDto) {
    return `This action updates a #${id} bid`;
  }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }
}
