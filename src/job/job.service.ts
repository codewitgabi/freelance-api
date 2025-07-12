import { Injectable } from "@nestjs/common";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto) {
    const job = await this.prisma.job.create({
      data: createJobDto,
    });

    return job;
  }

  findAll() {
    return `This action returns all job`;
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
