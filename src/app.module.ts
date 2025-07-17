import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { JobModule } from "./job/job.module";
import { PrismaModule } from "./prisma/prisma.module";
import { CaslModule } from "./casl/casl.module";
import { LoggerMiddleware } from "./common/middlewares/logger.middleware";
import { BidModule } from "./bid/bid.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    JobModule,
    PrismaModule,
    CaslModule,
    BidModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*"); // Apply to all routes
  }
}
