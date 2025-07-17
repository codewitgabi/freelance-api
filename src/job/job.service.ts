import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PaginationQueryDto } from "src/common/pagination-query.dto";
import { User } from "@prisma/client";

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name, { timestamp: true });

  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto, userId: number) {
    this.logger.log("Begin creating job", { payload: createJobDto });

    const job = await this.prisma.job.create({
      data: {
        ...createJobDto,
        userId,
      },
    });

    this.logger.log("Job creating completed");

    return job;
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    this.logger.log("Begin fetching all jobs with query", {
      query: paginationQuery,
    });

    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const jobs = await this.prisma.job.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await this.prisma.job.count();

    this.logger.log("Jobs fetched successfully", {
      payload: {
        total,
        page,
        limit,
      },
    });

    return {
      results: jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    this.logger.log("Begin fetching job with id", { id });

    const job = await this.prisma.job.findFirst({
      where: { id },
      include: {
        bids: true,
      },
    });

    if (!job) {
      this.logger.log("Job with id not found", { id });

      throw new NotFoundException("Job not found");
    }

    this.logger.log("Job with id retrieved and returned");

    return job;
  }

  async update(id: number, updateJobDto: UpdateJobDto, user: User) {
    this.logger.log("Begin updating job", {
      payload: updateJobDto,
      id,
      userId: user.id,
    });

    // Get user with id

    this.logger.log("Retrieving user with id", { id });

    const existingJob = await this.prisma.job.findFirst({ where: { id } });

    if (!existingJob) {
      this.logger.log("Job not found for given id", { id });

      throw new NotFoundException("Job not found");
    }

    this.logger.log("Job with id retrieved successfully");
    this.logger.log("Checking if user has permission to update job");

    if (user.id !== existingJob.userId) {
      this.logger.error("Permission denied; Current user cannot edit job");

      throw new ForbiddenException("Permission denied");
    }

    this.logger.log("User has permission to update job");

    const job = await this.prisma.job.update({
      where: { id },
      data: updateJobDto,
    });

    this.logger.log("Job updating completed");

    return job;
  }

  async delete(id: number, user: User) {
    this.logger.log("Begin deleting job", { id, userId: user.id });

    // Get user with given id

    this.logger.log("Retrieving user with id", { id });

    const job = await this.prisma.job.findFirst({ where: { id } });

    if (!job) {
      this.logger.log("Job not found for given id", { id });

      throw new NotFoundException("Job not found");
    }

    // Check ownership

    this.logger.log("Job with id retrieved successfully");
    this.logger.log("Checking if user has permission to update job");

    if (user.id !== job.userId) {
      this.logger.error("Permission denied; Current user cannot edit job");

      throw new ForbiddenException("Permission denied");
    }

    this.logger.log("User has permission to update job");
    this.logger.log("Job deletion completed");

    await this.prisma.job.delete({ where: { id } });
  }
}
