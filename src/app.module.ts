import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { JobModule } from "./job/job.module";
import { PrismaModule } from "./prisma/prisma.module";
import { CaslModule } from "./casl/casl.module";
import { LoggerMiddleware } from "./common/middlewares/logger.middleware";
import { BidModule } from "./bid/bid.module";
import { CacheModule } from "@nestjs/cache-manager";
import { TransactionModule } from './transaction/transaction.module';

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
    CacheModule.register({
      isGlobal: true,
    }),
    TransactionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*"); // Apply to all routes
  }
}
