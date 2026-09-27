import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsPositive,
  MaxLength,
} from 'class-validator';

export class CreateBookDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  author: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  edition: number;

  @IsOptional()
  @IsString()
  publisher: string;
}
