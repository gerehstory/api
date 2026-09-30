import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module'; // Assuming this is your main app module
import { SeedService } from './seeds.service'; // Make sure this path is correct

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seeder = app.get(SeedService); // Ensure SeedService is provided and exported correctly

  await seeder.run();

  await app.close();
}

bootstrap();
