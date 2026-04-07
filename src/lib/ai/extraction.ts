/**
 * Text extraction utilities for PDF, DOCX, and URL sources.
 */

import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import { validateExternalUrl } from '@/lib/security/url-validator';

// ---------------------------------------------------------------------------
// Response size limit — prevents OOM from very large remote pages.
// 5 MB covers virtually all legitimate help-center / docs pages while
// blocking multi-GB payloads that could crash the process.
// ---------------------------------------------------------------------------
export const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Extract plain text from a PDF buffer.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

/**
 * Extract plain text from a DOCX buffer.
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Read a Response body with a strict byte-count limit.
 * Reads the body as a stream so we never buffer more than `limit` bytes.
 * Throws immediately when the limit is exceeded.
 */
async function readResponseWithLimit(
  response: Response,
  limit: number
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    // Fallback for environments without streaming body
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > limit) {
      throw new Error(
        `Response too large: body exceeds ${limit} byte limit`
      );
    }
    return text;
  }

  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let totalBytes = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > limit) {
      await reader.cancel();
      throw new Error(
        `Response too large: body exceeds ${limit} byte limit after ${totalBytes} bytes`
      );
    }

    chunks.push(decoder.decode(value, { stream: true }));
  }

  // Flush any remaining bytes in the decoder
  chunks.push(decoder.decode());
  return chunks.join('');
}

/**
 * Scrape and extract main text content from a URL.
 *
 * SSRF-safe: uses `redirect: 'manual'` so redirects are validated against
 * the same hostname / IP blocklist before following.  Maximum 5 hops.
 */
export async function extractTextFromURL(url: string): Promise<string> {
  const MAX_REDIRECTS = 5;
  let currentUrl = url;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    // SSRF protection: validate every URL (initial + each redirect target)
    await validateExternalUrl(currentUrl);

    const response = await fetch(currentUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SupportAI/1.0; +https://example.com)'
      },
      signal: AbortSignal.timeout(15_000),
      redirect: 'manual'
    });

    // Handle redirects manually so we can validate the target
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) {
        throw new Error(
          `Redirect (${response.status}) from ${currentUrl} has no Location header`
        );
      }
      // Resolve relative redirects against the current URL
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch URL: ${response.status} ${response.statusText}`
      );
    }

    // --- Response size guard ---
    // 1. Early reject via Content-Length (untrusted but cheap)
    const contentLength = parseInt(
      response.headers.get('content-length') ?? '',
      10
    );
    if (!isNaN(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
      throw new Error(
        `Response too large: Content-Length ${contentLength} bytes exceeds ${MAX_RESPONSE_BYTES} byte limit`
      );
    }

    // 2. Stream-based enforcement — reads body in chunks and aborts if
    //    accumulated size exceeds the limit, preventing OOM even when
    //    Content-Length is missing or lying.
    const html = await readResponseWithLimit(response, MAX_RESPONSE_BYTES);
    const $ = cheerio.load(html);

    // Remove non-content elements
    $(
      'script, style, nav, header, footer, aside, iframe, noscript, [role="navigation"], [role="banner"], [role="contentinfo"]'
    ).remove();

    // Try to get main content first, fall back to body
    const mainContent =
      $('main').text() || $('article').text() || $('[role="main"]').text();

    const text = mainContent || $('body').text();

    // Clean up whitespace
    return text.replace(/\s+/g, ' ').trim();
  }

  throw new Error(`Too many redirects (>${MAX_REDIRECTS}) fetching ${url}`);
}

/**
 * Detect file type from the file name and return extracted text.
 */
export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const ext = fileName.toLowerCase().split('.').pop();

  switch (ext) {
    case 'pdf':
      return extractTextFromPDF(buffer);
    case 'docx':
      return extractTextFromDOCX(buffer);
    case 'txt':
    case 'md':
    case 'csv':
      return buffer.toString('utf-8');
    default:
      throw new Error(`Unsupported file type: .${ext}`);
  }
}
