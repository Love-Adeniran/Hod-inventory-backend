import { Injectable, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor() {
          const raw = process.env.DATABASE_URL;
    console.log('DATABASE_URL set?', !!raw);
    if (raw) {
        const u = new URL(raw);
        console.log('DB host:', u.hostname, 'port:', u.port);
    }
        super({
            adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}