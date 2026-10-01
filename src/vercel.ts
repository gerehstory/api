import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Request, type Response } from 'express';

import { AppModule } from './app.module';

const server = express();

let initialized = false;

async function bootstrap() {
  if (initialized) {
    return;
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    origin: '*',
  });

  await app.init();

  initialized = true;
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  await bootstrap();

  server(req, res);
}
