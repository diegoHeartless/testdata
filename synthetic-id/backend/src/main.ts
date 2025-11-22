import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  // Используем Pino logger
  const logger = app.get(Logger);
  app.useLogger(logger);

  // Глобальный префикс API
  app.setGlobalPrefix('api/v1');

  // Глобальные exception filters
  app.useGlobalFilters(
    new ValidationExceptionFilter(logger),
    new HttpExceptionFilter(logger),
  );

  // Валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          return Object.values(error.constraints || {}).join(', ');
        });
        return new BadRequestException(messages);
      },
    }),
  );

  // CORS
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : ['http://localhost:5173'];
  
  // В production добавляем разрешённые origins на основе переменных окружения
  if (process.env.NODE_ENV === 'production') {
    const frontendPort = process.env.FRONTEND_PORT || '5173';
    // Получаем IP сервера для добавления в разрешённые origins
    const serverHost = process.env.SERVER_HOST || '109.172.101.131';
    allowedOrigins.push(`http://${serverHost}:${frontendPort}`);
    allowedOrigins.push(`http://localhost:${frontendPort}`);
  }
  
  app.enableCors({
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (например, Postman, curl)
      if (!origin) {
        return callback(null, true);
      }
      // Проверяем, есть ли origin в списке разрешённых
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // В production также разрешаем origins с того же IP
      if (process.env.NODE_ENV === 'production' && origin.startsWith('http://109.172.101.131')) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Synthetic ID Generator API')
    .setDescription('API for generating synthetic personal data')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
      },
      'api-key',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  
  logger.log(`Application is running on: http://${host}:${port}`);
  logger.log(`Swagger docs available at: http://${host}:${port}/api/docs`);
}

bootstrap();

