import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsPositive,
  IsEnum,
  IsDateString,
} from "class-validator";
import { JobStatus } from "src/common/enums/job-status.enum";

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: "Budget must be a valid decimal" },
  )
  @IsPositive({ message: "Budget must be greater than zero" })
  budget: number;

  @IsDateString({}, { message: "Deadline must be a valid ISO date string" })
  deadline: string;

  @IsEnum(JobStatus, { message: "Status must be either open or close" })
  status: JobStatus;
}
