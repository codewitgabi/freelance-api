import {
  IsEmail,
  IsString,
  MaxLength,
  IsStrongPassword,
  IsEnum,
} from "class-validator";

enum NonAdminRole {
  client = "client",
  freelancer = "freelancer",
}

export class RegisterUserDto {
  @IsString()
  @MaxLength(30)
  username: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minSymbols: 1,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
  })
  password: string;

  @IsEnum(NonAdminRole, { message: "Role must be either client or freelancer" })
  role: NonAdminRole;
}
