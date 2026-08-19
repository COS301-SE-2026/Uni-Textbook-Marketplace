import { IsEnum } from 'class-validator';
import { ListingsStatus } from 'src/database/entities/listing.entity';

export class UpdateListingStatusDto {
    @IsEnum(ListingsStatus)    
    listing_status: ListingsStatus;
}