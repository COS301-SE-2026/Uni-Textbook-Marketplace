import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsUUID()
  faculty_id: string;

  @IsInt()
  @Min(1)
  semester: number;

  @IsOptional()
  university?: string;
}
