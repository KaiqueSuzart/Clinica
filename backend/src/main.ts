import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração de CORS
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Frontend dev
    'http://localhost:4173', // Frontend preview
    'http://127.0.0.1:4173',
    'http://127.0.0.1:5173',
  ];

  // Adicionar URLs de produção se definidas
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }
  if (process.env.FRONTEND_URL_WWW) {
    allowedOrigins.push(process.env.FRONTEND_URL_WWW);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requisições sem origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true);
      
      // Verificar se origin está na lista permitida
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validação global - temporariamente mais permissiva
  app.useGlobalPipes(new ValidationPipe({
    whitelist: false, // Permitir propriedades extras temporariamente
    forbidNonWhitelisted: false, // Não rejeitar propriedades extras
    transform: true,
    enableDebugMessages: true,
    disableErrorMessages: false,
  }));

  // Configuração do Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Clínica')
    .setDescription('API para sistema de gerenciamento clínico')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = config.app.port;
  await app.listen(port);
  console.log(`🚀 Aplicação rodando na porta ${port}`);
  console.log(`📚 Documentação disponível em http://localhost:${port}/api`);
}

bootstrap();
