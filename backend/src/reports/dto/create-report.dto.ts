import {
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateReportDto {
    @IsUUID()
    @IsNotEmpty()
    listing_id!: string;

    @IsString()
    @IsNotEmpty()
    reason!: string;
}