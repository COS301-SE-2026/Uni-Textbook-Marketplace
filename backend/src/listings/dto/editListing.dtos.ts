import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class EditListingDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsIn(['new', 'good', 'fair', 'poor'])
  condition?: 'new' | 'good' | 'fair' | 'poor';

  @IsOptional()
  @IsIn(['none', 'light', 'heavy'])
  annotation_level?: 'none' | 'light' | 'heavy';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photo_urls?: string[];

  @IsOptional()
  @IsBoolean()
  has_notes?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
