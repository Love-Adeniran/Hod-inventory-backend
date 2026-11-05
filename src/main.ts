import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
    app.useBodyParser('json', { limit: '10mb' });
    app.useBodyParser('urlencoded', { extended: true, limit: '10mb' });

    // Enable CORS for frontend applications
    app.enableCors({
        origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite React default is 5173
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    const config = new DocumentBuilder()
        .setTitle('Inventory API')
        .setDescription('Inventory management REST API')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = Number(process.env.PORT ?? 3000);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('PORT must be an integer between 1 and 65535.');
    }

    await app.listen(port);
    console.info(`Inventory API is listening on port ${port}.`);
}
bootstrap().catch((error: unknown) => {
    console.error('Failed to start the Inventory API.', error);
    process.exitCode = 1;
});