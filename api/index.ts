import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Request, type Response } from 'express';

import { AppModule } from '../src/app.module';

const server = express();

let bootstrapPromise: Promise<unknown> | undefined;

async function bootstrap(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    ).then(async (app) => {
      app.enableCors({
        origin: '*',
      });

      await app.init();
    });
  }

  await bootstrapPromise;
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  await bootstrap();

  server(req, res);
}
