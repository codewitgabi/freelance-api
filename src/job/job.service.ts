import { Injectable } from "@nestjs/common";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  create(createJobDto: CreateJobDto) {
    return createJobDto;
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
