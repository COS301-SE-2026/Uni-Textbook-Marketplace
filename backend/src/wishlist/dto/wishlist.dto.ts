import { IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class WishlistDto {

    @ApiProperty({
        example: '241447fc-e89d-4038-853c-2c2048df03d8',
    })
    @IsUUID()
    listing_id: string;
}