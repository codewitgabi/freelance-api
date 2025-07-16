import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { VersioningType } from "@nestjs/common";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { ValidationPipe } from "./common/pipes/validation.pipe";
import { LoggerMiddleware } from "./common/middlewares/logger.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ==== Configurations

  app.setGlobalPrefix("api");

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // ==== End configurations

  // === Middlewares

  app.use(new LoggerMiddleware().use.bind(new LoggerMiddleware()));

  // === End middlewares

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(() => {
  console.log("An error occurred starting the project");
});
