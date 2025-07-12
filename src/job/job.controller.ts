import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JobService } from "./job.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { Roles } from "src/common/decorators/role.decorator";
import { Role } from "@prisma/client";
import { RolesGuard } from "src/common/guards/roles.guard";
import { AuthGuard } from "src/common/guards/auth.guard";

@Controller("job")
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.client)
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobService.create(createJobDto);
  }

  @Get()
  findAll() {
    return this.jobService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.jobService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService.update(+id, updateJobDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.jobService.remove(+id);
  }
}
