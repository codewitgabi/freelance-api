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

  async update(id: number, updateBidDto: UpdateBidDto, user: User) {
    this.logger.log("Begin updating bid", { id, userId: user.id });

    // Check if bid with id exists in database

    this.logger.log("Checking if bid with id exists");

    const bid = await this.prisma.bid.findUnique({
      where: { id },
    });

    if (!bid) {
      this.logger.error("Bid not found", { id });

      throw new NotFoundException("Bid not found");
    }

    this.logger.log("Bid with id found");

    // Check if user has permission to update bid

    this.logger.log("Checking if user has permission to update bid");

    if (bid.userId !== user.id) {
      this.logger.error("User does not have the permission to update bid");

      throw new ForbiddenException("Permission denied");
    }

    this.logger.log("User has permission to update bid");

    // Update bid

    this.logger.log("Updating bid");

    const updatedBid = await this.prisma.bid.update({
      where: { id, userId: user.id },
      data: updateBidDto,
    });

    this.logger.log("Bid updated successfully");

    return updatedBid;
  }

  async delete(id: number, user: User) {
    this.logger.log("Begin bid deletion process", { id, userId: user.id });

    // Check if bid exists

    this.logger.log("Checking if bid exists");

    const bid = await this.prisma.bid.findUnique({ where: { id } });

    if (!bid) {
      this.logger.error("Bid not found", { id });

      throw new NotFoundException("Bid not found");
    }

    this.logger.log("Bid found");

    // Check if user has permission to delete bid

    this.logger.log("Checking if user has permission to delete bid");

    if (bid.userId !== user.id) {
      this.logger.error("User does not have the permission to delete bid");

      throw new ForbiddenException("Permission denied");
    }

    this.logger.log("User has permission to delete bid");

    // Delete bid

    this.logger.log("Deleting bid");

    await this.prisma.bid.delete({ where: { id } });

    this.logger.log("Bid deletion process completed successfully");
  }
}
