import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Size } from '@prisma/client';

export class CreateItemDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsString()
    image?: string;

    @IsString()
    @IsNotEmpty()
    size!: Size;

    @IsString()
    @IsNotEmpty()
    color!: string;
}
