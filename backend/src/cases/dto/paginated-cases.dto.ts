import { ApiProperty } from '@nestjs/swagger';
import { CaseResponseDto } from './case-response.dto';

export class PaginatedCasesDto {
  @ApiProperty({ type: [CaseResponseDto] })
  data!: CaseResponseDto[];

  @ApiProperty()
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  static fromPaginatedResult(result: {
    data: CaseResponseDto[];
    total: number;
    page: number;
    limit: number;
  }): PaginatedCasesDto {
    const dto = new PaginatedCasesDto();
    dto.data = result.data;
    dto.meta = {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    };
    return dto;
  }
}
