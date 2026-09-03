import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // El límite por defecto de Express (~100kb) es insuficiente para la foto del
  // colaborador (data URL en base64) que envía EmployeePhotoCapture en el
  // frontend; no hay storage de archivos en este proyecto, así que la imagen
  // ya comprimida viaja como JSON normal en el body del PATCH.
  app.useBodyParser('json', { limit: '8mb' });

  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
