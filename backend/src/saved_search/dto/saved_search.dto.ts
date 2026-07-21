import {
  IsObject,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsUUID,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SavedSearch } from '../../database/entities/saved_search.entity';

// Request DTOs
export class CreateSavedSearchDto {
  @IsObject()
  filter_json!: Record<string, any>;
}

export class SavedSearchFiltersDto {
  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  book_title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_max?: number;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  annotation_level?: string;

  @IsOptional()
  @IsUUID()
  university_id?: string;

  @IsOptional()
  @IsUUID()
  faculty_id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modules?: string[];
}

export class GetSavedSearchesQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}

// Response DTOs
export class SavedSearchResponseDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  user_id!: string;

  @IsObject()
  filter_json!: Record<string, any>;

  @IsDate()
  @Type(() => Date)
  created_at!: Date;

  static fromEntity(entity: SavedSearch): SavedSearchResponseDto {
    const dto = new SavedSearchResponseDto();
    dto.id = entity.id;
    dto.user_id = entity.user_id;
    dto.filter_json = entity.filter_json;
    dto.created_at = entity.created_at;
    return dto;
  }

  static fromEntities(entities: SavedSearch[]): SavedSearchResponseDto[] {
    return entities.map((entity) => SavedSearchResponseDto.fromEntity(entity));
  }
}

export class PaginatedSavedSearchResponseDto {
  data!: SavedSearchResponseDto[];
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  static fromPaginatedResult(result: {
    data: SavedSearch[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }): PaginatedSavedSearchResponseDto {
    const dto = new PaginatedSavedSearchResponseDto();
    dto.data = SavedSearchResponseDto.fromEntities(result.data);
    dto.meta = {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
    return dto;
  }
}
