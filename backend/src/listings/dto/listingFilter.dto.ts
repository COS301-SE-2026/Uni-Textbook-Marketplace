import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class ListingFiltersDto {
    @IsOptional()
    @IsString()
    moduleCode?: string;

    @IsOptional()
    @IsString()
    faculty?: string;

    @IsOptional()
    @IsString()
    condition?: string;

    @IsOptional()
    @IsString()
    annotationLevel?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    priceMin?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    priceMax?: number;
}