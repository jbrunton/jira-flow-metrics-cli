import { NestFactory } from "@nestjs/core";
import { LocalDatabase } from "./data/db.mjs";
import "./app/lib/prompts/register.mjs";
import { AppModule } from "./app/app_module.js";
import { MainMenu } from "./app/main_menu.js";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn"],
  });

  const db = await app.resolve(LocalDatabase);
  await db.read();

  const menu = await app.resolve(MainMenu);
  await menu.run();
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
