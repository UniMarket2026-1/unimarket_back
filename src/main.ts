import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

function normalizeOrigin(value: string | undefined) {
  if (!value) return undefined;

  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) return undefined;

  return trimmed.replace(/^https:\/\/https:\/\//i, 'https://').replace(/^http:\/\/http:\/\//i, 'http://');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL) || 'https://unimarketfront.vercel.app';

  // Enable CORS with proper configuration
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? [frontendOrigin] : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 UniMarket Backend running on port ${port}`);
  console.log(`📡 API available at http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});

