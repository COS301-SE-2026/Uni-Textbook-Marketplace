export class MatchedBookDto {
  id!: string;
  title!: string;
  author!: string;
  isbn!: string;
  edition!: string;
  confidence!: number;
}

export class ExtractTextResponseDto {
  rawText!: string;
  matchedBooks!: MatchedBookDto | null;
}
