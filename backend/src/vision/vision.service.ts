import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Book } from '../database/entities/book.entity';
import {
  matchBookFromText,
  OcrLine,
  BookMatchResult,
} from './book-matcher.util';
import {
  extractBookDetails,
  ExtractedBookDetails,
} from './book-details-extractor.util';

interface AzureLine {
  text: string;
  boundingPolygon: { x: number; y: number }[];
}
interface AzureBlock {
  lines: AzureLine[];
}

interface AzureReadResponse {
  readResult?: { blocks?: AzureBlock[] };
}

@Injectable()
export class VisionService {
  private readonly logger = new Logger(VisionService.name);
  private readonly endpoint: string;
  private readonly key: string;

  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) {
    const endpoint = process.env.AZURE_VISION_ENDPOINT;
    const key = process.env.AZURE_VISION_KEY;

    if (!endpoint) {
      throw new Error('AZURE_VISION_ENDPOINT is missing from .env');
    }
    if (!key) {
      throw new Error('AZURE_VISION_KEY is missing from .env');
    }

    this.endpoint = endpoint.replace(/\/+$/, '');
    this.key = key;
  }

  async extractLines(imageUrl: string): Promise<OcrLine[]> {
    if (!imageUrl) {
      throw new BadRequestException('imageUrl is required');
    }

    const url = `${this.endpoint}/computervision/imageanalysis:analyze?api-version=2024-02-01&features=read`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl }),
      });
    } catch (err) {
      this.logger.error(`Could not reach Azure Vision: ${String(err)}`);
      throw new InternalServerErrorException(
        'Failed to reach Azure Vision service',
      );
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      this.logger.error(
        `Azure Vision ${res.status} for ${imageUrl.split('?')[0]}: ${body}`,
      );
      throw new InternalServerErrorException(
        `Azure Vision returned ${res.status}`,
      );
    }

    const data = (await res.json()) as AzureReadResponse;
    const blocks = data.readResult?.blocks ?? [];

    const lines: OcrLine[] = [];
    for (const block of blocks) {
      for (const line of block.lines ?? []) {
        const ys = line.boundingPolygon?.map((p) => p.y) ?? [];
        const topY = ys.length ? Math.min(...ys) : 0;
        const bottomY = ys.length ? Math.max(...ys) : 0;
        lines.push({
          text: line.text,
          topY,
          height: bottomY - topY,
        });
      }
    }
    return lines;
  }

  async extractTextAndMatch(imageUrl: string): Promise<{
    rawText: string;
    matchBook: BookMatchResult | null;
    details: ExtractedBookDetails;
  }> {
    const lines = await this.extractLines(imageUrl);

    const rawText = [...lines]
      .sort((a, b) => a.topY - b.topY)
      .map((l) => l.text)
      .join('\n');

    const candidates = await this.bookRepo.find();
    const matchedBook = matchBookFromText(lines, candidates);

    const details = extractBookDetails(lines);

    return { rawText, matchBook: matchedBook, details };
  }
}
