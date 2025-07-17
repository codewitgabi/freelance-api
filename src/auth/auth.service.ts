import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { RegisterUserDto } from "./dto/register-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthUserEntity } from "./entities/auth-user.entity";
import { JwtService } from "@nestjs/jwt";
import { plainToInstance } from "class-transformer";
import { LoginUserDto } from "./dto/login-user.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name, { timestamp: true });

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(registerUserDto: RegisterUserDto) {
    // Extract data from request

    this.logger.log("Begin user registration");

    const { username, email, password, role } = registerUserDto;

    // Check if user with email already exists

    this.logger.log("Checking if user with email already exists");

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      this.logger.log("User with email already exists");

      throw new BadRequestException("User with email already exists");
    }

    // User with email does not already exist, create user account

    this.logger.log("User with email does not exist");

    const hashedPassword = bcrypt.hashSync(password);

    // === Transaction to create user, create a wallet and associate it to the user

    this.logger.log(
      "Start transaction to create new account and attach wallet to created user",
    );

    const newUser = await this.prisma.$transaction(async (tx) => {
      // Create and store user

      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role,
          wallet: {
            create: {
              balance: 0.0,
            },
          },
        },
      });

      return user;
    });

    this.logger.log("Transaction completed; User account created successfully");

    // === End transaction

    this.logger.log("Serializing user data");

    const serializedUser = plainToInstance(AuthUserEntity, newUser, {
      excludeExtraneousValues: true,
    });

    this.logger.log("User serialization completed");

    // Generate user access token

    this.logger.log("Generating user access token");

    const payload = {
      sub: serializedUser.id,
      username: serializedUser.username,
    };

    const accessToken = await this.generateAccessToken(payload);

    this.logger.log("Access token for user generated successfully");
    this.logger.log("User registration process completed");

    return { accessToken, user: serializedUser };
  }

  async login(loginUserDto: LoginUserDto) {
    // Get request data

    this.logger.log("Begin user login");

    const { email, password } = loginUserDto;

    // Check if there is a user associated with the email

    this.logger.log("Checking if there is a user associated with given email", {
      email,
    });

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.error("User with email does not exist");

      throw new BadRequestException("User with email does not exist");
    }

    this.logger.log("User with email exists");

    // Verify the password

    this.logger.log("Verifying user password");

    const matchPassword = bcrypt.compareSync(password, user.password);

    if (!matchPassword) {
      this.logger.error("Incorrect password");

      throw new BadRequestException("Incorrect password");
    }

    this.logger.log("Password is correct");

    this.logger.log("Serializing user data");

    const serializedUser = plainToInstance(AuthUserEntity, user, {
      excludeExtraneousValues: true,
    });

    this.logger.log("User data serialization completed");

    // Generate user access token

    this.logger.log("Generating access token for user");

    const payload = {
      sub: serializedUser.id,
      username: serializedUser.username,
    };

    const accessToken = await this.generateAccessToken(payload);

    this.logger.log("Access token for user generated successfully");
    this.logger.log("User login process completed");

    return { accessToken, user: serializedUser };
  }

  async generateAccessToken(payload: {
    sub: number;
    username: string;
  }): Promise<string> {
    /**
     * Sign and return a jwt signed token
     */

    this.logger.log("Generating access token");

    const accessToken = await this.jwtService.signAsync(payload);

    this.logger.log("Access token generated successfully");

    return accessToken;
  }
}
