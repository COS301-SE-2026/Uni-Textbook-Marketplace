import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDto {
    @IsString()
    @IsNotEmpty()
    listingId: string;

    @IsString()
    @IsNotEmpty()
    reason: string;
}