import { IsDateString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateAuctionDto {
    @IsUUID()
    listing_id!: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    starting_price!: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    reserve_price?: number;

    @IsOptional()
    @IsDateString()
    start_time?: string;

    @IsDateString()
    end_time!: string;
}