import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Express } from 'express';
import { AppModule } from './src/app.module';

let server: Express;

async function bootstrap() {
  const expressApp = express();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.enableCors({
    origin: '*',
  });

  await app.init();

  return expressApp;
}

export default async function handler(
  req: express.Request,
  res: express.Response,
) {
  server ??= await bootstrap();

  return server(req, res);
}
