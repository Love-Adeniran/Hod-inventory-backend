import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ItemsModule } from './items/items.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
    imports: [PrismaModule, AuthModule, ItemsModule],
    controllers: [AppController],
})
export class AppModule { }