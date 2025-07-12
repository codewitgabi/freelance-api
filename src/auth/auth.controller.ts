import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import SuccessResponse from "src/common/responses/success-response";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post("register")
  async create(@Body() registerUserDto: RegisterUserDto) {
    const data = await this.authService.create(registerUserDto);

    return SuccessResponse({
      message: "User created successfully",
      data,
    });
  }
}
