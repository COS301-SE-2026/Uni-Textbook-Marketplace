export interface MatchedBook {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  edition: string;
  confidence: number;
}

export interface ExtractedBookDetails {
  title: string | null;
  author: string | null;
  edition: string | null;
  isbn: string | null;
  publisher: string | null;
}

export interface ExtractTextResult {
  rawText: string;
  matchedBook: MatchedBook | null;
  extracted?: ExtractedBookDetails;
}

export const VISION_TIMEOUT_MS = 10_000;

export async function extractText(
  imageUrl: string,
  timeoutMs: number = VISION_TIMEOUT_MS,
): Promise<ExtractTextResult> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}/vision/extract-text`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Text extraction failed');
    }

    return (await response.json()) as ExtractTextResult;
  } finally {
    clearTimeout(timer);
  }
}