import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Book } from '../database/entities/book.entity';
import {
  matchBookFromText,
  OcrLine,
  BookMatchResult,
} from './book-matcher.util';

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
    } catch {
      throw new InternalServerErrorException(
        'Failed to reach Azure Vision service',
      );
    }

    if (!res.ok) {
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
  }> {
    const lines = await this.extractLines(imageUrl);

    const rawText = [...lines]
      .sort((a, b) => a.topY - b.topY)
      .map((l) => l.text)
      .join('\n');

    const candidates = await this.bookRepo.find();
    const matchedBook = matchBookFromText(lines, candidates);

    return { rawText, matchBook: matchedBook };
  }
}
