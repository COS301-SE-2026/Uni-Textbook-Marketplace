import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

import { ReportCategory } from '../enums/report-category.dto';

export class CreateReportDto {
    @IsUUID()
    @IsNotEmpty()
    listing_id!: string;

    @IsEnum(ReportCategory)
    category!: ReportCategory;

    @IsString()
    @IsNotEmpty()
    reason!: string;
}