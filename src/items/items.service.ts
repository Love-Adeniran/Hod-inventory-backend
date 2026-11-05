import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.ts';
import type { CreateItemDto } from './dto/create-item.dto.ts';
import type { UpdateItemDto } from './dto/update-item.dto.ts';

@Injectable()
export class ItemsService {
    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
    ) { }

    create(createItemDto: CreateItemDto, userId: number) {
        const { name, size, description, color, images, image } = createItemDto;
        const imageValues = images ?? (image ? [image] : []);
        return this.prisma.item.create({
            data: {
                name,
                size,
                description,
                color,
                images: { create: imageValues.map((imgName) => ({ imgName })) },
                userId,
            },
            include: { images: true },
        });
    }

    findAll(userId: number) {
        return this.prisma.item.findMany({ where: { userId }, include: { images: true } });
    }

    findOne(id: string, userId: number) {
        return this.prisma.item.findFirst({ where: { id, userId }, include: { images: true } });
    }

    async update(id: string, updateItemDto: UpdateItemDto, userId: number) {
        const existing = await this.prisma.item.findFirst({ where: { id, userId } });
        if (!existing) throw new NotFoundException('Item not found');

        const { name, size, description, color, images, image } = updateItemDto;
        const imageValues = images ?? (image ? [image] : []);
        return this.prisma.item.update({
            where: { id },
            data: {
                name,
                size,
                description,
                color,
                ...(images !== undefined || image !== undefined
                    ? {
                        images: {
                            deleteMany: {},
                            create: imageValues.map((imgName) => ({ imgName })),
                        },
                    }
                    : {}),
            },
            include: { images: true },
        });
    }

    async remove(id: string, userId: number) {
        const result = await this.prisma.item.deleteMany({ where: { id, userId } });
        if (result.count === 0) throw new NotFoundException('Item not found');
        return { deleted: true };
    }
}