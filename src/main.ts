import { config } from 'dotenv';
//config({ path: process.env.NODE_ENV ? '.env.production' : '.env.development' });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthenticatedWsIoAdapter } from './adapters/AuthenticatedWsIoAdapter';
import { SystemLogger } from './logger/services/systemLogger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{cors: true, logger: false});
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new AuthenticatedWsIoAdapter(app));
  app.useLogger(new SystemLogger());
  await app.listen(process.env.APP_PORT);
}
bootstrap();
