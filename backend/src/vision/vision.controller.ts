import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { ExtractTextDto } from './dto/extract-text.dto';
import { ExtractTextResponseDto } from './dto/extract-text-response.dto';
import { VisionService } from './vision.service';

@ApiTags('Vision')
@Controller('vision')
export class VisionController {
  constructor(private readonly visionService: VisionService) {}

  @Post('extract-text')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({
    summary:
      'OCR a textbook cover image and fuzzy-match it against known books',
  })
  async extractText(
    @Body() dto: ExtractTextDto,
  ): Promise<ExtractTextResponseDto> {
    const {
      rawText,
      matchBook: matchedBook,
      details,
    } = await this.visionService.extractTextAndMatch(dto.imageUrl);

    return {
      rawText,
      matchedBook: matchedBook
        ? {
            id: matchedBook.book.id,
            title: matchedBook.book.title,
            author: matchedBook.book.author ?? null,
            isbn: matchedBook.book.isbn ?? null,
            publisher: matchedBook.book.publisher ?? null,
            edition:
              matchedBook.book.edition != null
                ? String(matchedBook.book.edition)
                : '',
            confidence: matchedBook.confidence,
          }
        : null,
      extracted: details,
    };
  }
}
