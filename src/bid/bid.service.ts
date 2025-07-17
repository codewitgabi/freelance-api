import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { CreateBidDto } from "./dto/create-bid.dto";
import { UpdateBidDto } from "./dto/update-bid.dto";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { plainToInstance } from "class-transformer";
import { BidEntity } from "./entities/bid.entity";

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

  async findAll(jobId: number, user: User) {
    /**
     * Fetch all bids for provided jobId for jobs created by user
     */

    this.logger.log("Begin fetching all bids for job", {
      jobId,
      userId: user.id,
    });

    // Get job with given id

    this.logger.log("Checking if job with provided id exists in db");

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      this.logger.error("Job not found", { jobId });

      throw new NotFoundException("Job not found");
    }

    this.logger.log("Job for provided id retrieved successfully");

    // Check if user has permission to view bids [Only clients who created the job can see bids]

    this.logger.log("Checking if user has permission to view bids");

    if (job.userId !== user.id) {
      this.logger.error("User does not have the permission to view bids");

      throw new ForbiddenException("Permission denied");
    }

    this.logger.log("User has permission to view bids");

    // Get bids

    this.logger.log("Fetching bids");

    const bids = await this.prisma.bid.findMany({
      where: { jobId },
      include: {
        user: true,
      },
    });

    const transformedBids = bids.map((bid) => ({
      ...bid,
      budget: Number(bid.budget),
    }));

    const serializedBids = plainToInstance(BidEntity, transformedBids, {
      excludeExtraneousValues: true,
    });

    this.logger.log("Bids retrieved successfully");

    return serializedBids;
  }

  async findOne(id: number, jobId: number, user: User) {
    this.logger.log("Begin finding bid", { id, jobId });

    // Retrieve bid from database

    const bid = await this.prisma.bid.findUnique({
      where: { id, jobId },
      include: { job: true },
    });

    if (!bid) {
      this.logger.error("Bid not found", { id });

      throw new NotFoundException("Bid not found");
    }

    this.logger.log("Bid retrieved successfully");

    // Check if user has permission to view bid

    this.logger.log("Checking if user has permission to view bid");

    if (bid.job.userId !== user.id) {
      this.logger.error("User does not have the permission to view bid");

      throw new ForbiddenException("Permission denied");
    }

    this.logger.log("User has permission to view bid");

    return bid;
  }

  update(id: number, updateBidDto: UpdateBidDto) {
    return `This action updates a #${id} bid`;
  }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }
}
