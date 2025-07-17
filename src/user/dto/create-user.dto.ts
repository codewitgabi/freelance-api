import { IsString, MaxLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  @MaxLength(30)
  username: string;

  @IsString()
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MaxLength(50)
  lastName: string;
}
