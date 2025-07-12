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
import { LoginUserDto } from "./dto/login-user.dto";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async create(@Body() registerUserDto: RegisterUserDto) {
    const data = await this.authService.create(registerUserDto);

    return SuccessResponse({
      message: "ACcount created successfully",
      data,
    });
  }

  @Post("login")
  async login(@Body() loginUserDto: LoginUserDto) {
    const data = await this.authService.login(loginUserDto);

    return SuccessResponse({
      message: "Login successful",
      data,
    });
  }
}
