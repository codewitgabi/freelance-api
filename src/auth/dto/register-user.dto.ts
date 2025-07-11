import {
  IsEmail,
  IsString,
  MaxLength,
  IsStrongPassword,
} from "class-validator";

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
}
