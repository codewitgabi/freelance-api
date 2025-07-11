import { Injectable } from "@nestjs/common";
import { RegisterUserDto } from "./dto/register-user.dto";

@Injectable()
export class AuthService {
  create(registerUserDto: RegisterUserDto) {
    console.log({ registerUserDto });
    return {
      accessToken: "ey...",
      id: 2,
      username: "codewitgabi",
    };
  }
}
