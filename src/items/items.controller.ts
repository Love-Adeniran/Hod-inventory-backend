import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ItemsService } from './items.service.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { Size } from '@prisma/client';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/authenticated-user.js';

@Controller('items')
@UseGuards(SessionAuthGuard)
export class ItemsController {
    constructor(
        @Inject(ItemsService) private readonly itemsService: ItemsService,
    ) { }



@Get('meta/sizes')
getSizes() {
    return Object.values(Size);
}

    @Post()
    create(
        @Body() createItemDto: CreateItemDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.itemsService.create(createItemDto, user.id);
    }

    @Get()
    findAll(@CurrentUser() user: AuthenticatedUser) {
        return this.itemsService.findAll(user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.itemsService.findOne(id, user.id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateItemDto: UpdateItemDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.itemsService.update(id, updateItemDto, user.id);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.itemsService.remove(id, user.id);
    }
}