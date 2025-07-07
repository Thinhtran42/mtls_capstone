import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/logger.config';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import { AuthHeaderInterceptor } from './auth/auth-header.interceptor';

dotenv.config(); // Nạp các biến môi trường từ file .env

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  const port = process.env.PORT ?? 3000;
  const host = process.env.HOST ?? 'localhost';

  // Đặt global prefix - nên đặt sau các middleware và trước khi cấu hình Swagger
  // app.setGlobalPrefix('api', {
  //   exclude: ['/docs', '/docs-json', '/docs/*'],
  // });

  // Cấu hình CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Middleware ghi log các yêu cầu
  app.use((req, res, next) => {
    console.log('Request:', {
      origin: req.headers.origin,
      method: req.method,
      path: req.url,
    });
    next();
  });

  // Middleware đảm bảo tất cả URL đều có tiền tố /api
  // app.use((req, res, next) => {
  //   const path = req.url;
  //   if (!path.startsWith('/api') && !path.startsWith('/docs')) {
  //     req.url = `/api${path}`;
  //   }
  //   next();
  // });

  // Đặt Swagger ở đường dẫn khác
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription("The API's MTLS description")
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // Đổi từ 'api' thành 'docs'

  app.useGlobalPipes(new ValidationPipe({}));
  //app.enableVersioning({ type: VersioningType.URI });

  // Vô hiệu hóa một số bảo vệ của helmet có thể gây ra vấn đề CORS
  // app.use(
  //   helmet({
  //     crossOriginResourcePolicy: false,
  //     crossOriginOpenerPolicy: false,
  //     contentSecurityPolicy: false,
  //   }),
  // );
  app.use(compression());

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new AuthHeaderInterceptor());

  // Đảm bảo server lắng nghe trên tất cả các interface (quan trọng cho Docker)
  await app.listen(port, '0.0.0.0');

  // Log URL của Swagger
  console.log(`Swagger is running on: http://${host}:${port}/docs`);
  console.log(`Server running on http://0.0.0.0:${port}`);
}
bootstrap();
