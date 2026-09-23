import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsIn,
  IsNumber,
  IsPositive,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateListingDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsUUID()
  bookId!: string;

  @IsOptional()
  @IsUUID()
  moduleId?: string;
  //missing sellerId

  @IsIn(['new', 'good', 'fair', 'poor'])
  condition: 'new' | 'good' | 'fair' | 'poor';

  @IsIn(['none', 'light', 'heavy'])
  annotationLevel: 'none' | 'light' | 'heavy';

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];

  @IsOptional()
  @IsBoolean()
  hasNotes?: boolean;

  @IsNotEmpty()
  @IsString()
  description: string;
}
