import { BadRequestException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { RegisterUserDto } from "./dto/register-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthUserEntity } from "./entities/auth-user.entity";
import { JwtService } from "@nestjs/jwt";
import { plainToInstance } from "class-transformer";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(registerUserDto: RegisterUserDto) {
    // Extract data from request

    const { username, email, password } = registerUserDto;

    // Check if user with email already exists

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException("User with email already exists");
    }

    // User with email does not already exist, create user account

    const hashedPassword = bcrypt.hashSync(password);

    // === Transaction to create user, create a wallet and associate it to the user

    const newUser = await this.prisma.$transaction(async (tx) => {
      // Create and store user

      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          wallet: {
            create: {
              balance: 0.0,
            },
          },
        },
      });

      return user;
    });

    // === End transaction

    const serializedUser = plainToInstance(AuthUserEntity, newUser, {
      excludeExtraneousValues: true,
    });

    // Generate user access token

    const payload = {
      sub: serializedUser.id,
      username: serializedUser.username,
    };

    const accessToken = await this.generateAccessToken(payload);

    return { accessToken, user: serializedUser };
  }

  async generateAccessToken(payload: {
    sub: number;
    username: string;
  }): Promise<string> {
    /**
     * Sign and return a jwt signed token
     */

    const accessToken = await this.jwtService.signAsync(payload);

    return accessToken;
  }
}
