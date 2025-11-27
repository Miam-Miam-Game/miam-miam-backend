import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // supprime les champs non prévus dans le DTO
      forbidNonWhitelisted: true, // bloque les champs inattendus
      transform: true,         // <-- transforme automatiquement "123" en 123
    }),
  );

  await app.listen(process.env.PORT ?? 4500);
}
bootstrap();
