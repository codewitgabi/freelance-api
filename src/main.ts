import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { VersioningType } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ==== Configurations

  app.setGlobalPrefix("api");

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // ==== End configurations

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(() => {
  console.log("An error occurred starting the project");
});
