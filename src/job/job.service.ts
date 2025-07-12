import { Injectable } from "@nestjs/common";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PaginationQueryDto } from "src/common/pagination-query.dto";

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto) {
    const job = await this.prisma.job.create({
      data: createJobDto,
    });

    return job;
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const jobs = await this.prisma.job.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await this.prisma.job.count();

    return {
      results: jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} job`;
  }

  update(id: number, updateJobDto: UpdateJobDto) {
    return updateJobDto;
  }

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
