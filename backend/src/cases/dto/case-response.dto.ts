import { ApiProperty } from '@nestjs/swagger';

export class CaseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  user_id!: string;

  @ApiProperty({ nullable: true })
  appeal_message!: string | null;

  @ApiProperty()
  status!: string;

  @ApiProperty({ nullable: true })
  reviewed_by!: string | null;

  @ApiProperty({ nullable: true })
  reviewed_at!: Date | null;

  @ApiProperty({ nullable: true })
  created_at!: Date;

  @ApiProperty({ nullable: true })
  updated_at!: Date | null;

  @ApiProperty({ nullable: true })
  deleted_at!: Date | null;

  static fromEntity(entity: any): CaseResponseDto {
    const dto = new CaseResponseDto();
    dto.id = entity.id;
    dto.user_id = entity.user_id; 
    dto.appeal_message = entity.appeal_message;
    dto.status = entity.status;
    dto.reviewed_by = entity.reviewed_by;
    dto.reviewed_at = entity.reviewed_at;
    dto.created_at = entity.created_at;
    dto.updated_at = entity.updated_at;
    dto.deleted_at = entity.deleted_at;
    return dto;
  }
}
