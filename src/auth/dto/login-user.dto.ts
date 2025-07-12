import { IsEmail, IsStrongPassword } from "class-validator";

export class LoginUserDto {
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
}
