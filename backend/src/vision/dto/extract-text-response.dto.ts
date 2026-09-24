export class MatchedBookDto {
  id!: string;
  title!: string;
  author!: string | null;
  isbn!: string | null;
  publisher!: string | null;
  edition!: string;
  confidence!: number;
}

export class ExtractedDetailsDto {
  title!: string | null;
  author!: string | null;
  edition!: string | null;
  isbn!: string | null;
  publisher!: string | null;
}

export class ExtractTextResponseDto {
  rawText!: string;
  matchedBook!: MatchedBookDto | null;
  extracted!: ExtractedDetailsDto;
}
