// item.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import type { Size } from '@prisma/client';

export class ItemImage {
    @ApiProperty({ description: 'The unique identifier of the image' })
    id!: string;

    @ApiProperty({ description: 'The image data URL' })
    imgName!: string;
}

export class Item {
    @ApiProperty({ description: 'The unique identifier of the item' })
    id!: string;

    @ApiProperty({ description: 'The name of the inventory item' })
    name!: string;

    @ApiProperty({ description: 'Images attached to the item', type: [ItemImage] })
    images!: ItemImage[];

    @ApiProperty({ description: 'Item size/dimension' })
    size!: Size;

    @ApiProperty({ description: 'Item description' })
    description!: string;

    @ApiProperty({ description: 'Color variation' })
    color!: string;

    createdAt!: Date;
    updatedAt!: Date;
}
