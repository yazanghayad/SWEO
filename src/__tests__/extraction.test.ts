/**
 * @vitest-environment node
 *
 * Extraction tests — focused on SSRF redirect protection.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────

const mockValidateExternalUrl = vi.fn();
vi.mock('@/lib/security/url-validator', () => ({
  validateExternalUrl: (...args: unknown[]) => mockValidateExternalUrl(...args)
}));

// Mock pdf-parse & mammoth (not used but imported at module level)
vi.mock('pdf-parse', () => ({
  PDFParse: vi.fn()
}));
vi.mock('mammoth', () => ({
  default: { extractRawText: vi.fn() }
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { extractTextFromURL } from '@/lib/ai/extraction';
import { MAX_RESPONSE_BYTES } from '@/lib/ai/extraction';

// ── Helpers ──────────────────────────────────────────────────────────────

function htmlResponse(body: string, status = 200): Response {
  return new Response(`<html><body>${body}</body></html>`, {
    status,
    headers: { 'Content-Type': 'text/html' }
  });
}

function redirectResponse(location: string, status = 302): Response {
  return new Response(null, {
    status,
    headers: { Location: location }
  });
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('extractTextFromURL — SSRF redirect protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: all URLs pass validation
    mockValidateExternalUrl.mockResolvedValue(undefined);
  });

  it('fetches a URL with redirect: manual', async () => {
    mockFetch.mockResolvedValueOnce(htmlResponse('Hello world'));
    await extractTextFromURL('https://example.com');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({ redirect: 'manual' })
    );
  });

  it('validates the initial URL via validateExternalUrl', async () => {
    mockFetch.mockResolvedValueOnce(htmlResponse('content'));
    await extractTextFromURL('https://safe.com/page');

    expect(mockValidateExternalUrl).toHaveBeenCalledWith('https://safe.com/page');
  });

  it('follows a redirect and validates the target URL', async () => {
    mockFetch
      .mockResolvedValueOnce(redirectResponse('https://cdn.example.com/page'))
      .mockResolvedValueOnce(htmlResponse('Redirected content'));

    const result = await extractTextFromURL('https://example.com/old');

    // Both URLs validated
    expect(mockValidateExternalUrl).toHaveBeenCalledTimes(2);
    expect(mockValidateExternalUrl).toHaveBeenCalledWith('https://example.com/old');
    expect(mockValidateExternalUrl).toHaveBeenCalledWith('https://cdn.example.com/page');
    expect(result).toContain('Redirected content');
  });

  it('blocks redirect to internal IP (cloud metadata SSRF)', async () => {
    mockValidateExternalUrl
      .mockResolvedValueOnce(undefined) // Initial URL passes
      .mockRejectedValueOnce(
        new Error('URL "metadata.google.internal" resolves to a blocked private IP (169.254.169.254)')
      );

    mockFetch.mockResolvedValueOnce(
      redirectResponse('http://metadata.google.internal/computeMetadata/v1/')
    );

    await expect(
      extractTextFromURL('https://attacker.com/redirect')
    ).rejects.toThrow('blocked private IP');

    // The internal URL was never actually fetched
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://attacker.com/redirect',
      expect.any(Object)
    );
  });

  it('blocks redirect to localhost', async () => {
    mockValidateExternalUrl
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Blocked hostname: localhost'));

    mockFetch.mockResolvedValueOnce(
      redirectResponse('http://localhost:8080/admin')
    );

    await expect(
      extractTextFromURL('https://evil.com/redir')
    ).rejects.toThrow('Blocked hostname');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('blocks redirect to RFC 1918 private IP', async () => {
    mockValidateExternalUrl
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('resolves to a blocked private IP (10.0.0.1)'));

    mockFetch.mockResolvedValueOnce(
      redirectResponse('http://internal-service.local/')
    );

    await expect(
      extractTextFromURL('https://public-site.com')
    ).rejects.toThrow('blocked private IP');
  });

  it('handles multi-hop redirects (all validated)', async () => {
    mockFetch
      .mockResolvedValueOnce(redirectResponse('https://hop1.com'))
      .mockResolvedValueOnce(redirectResponse('https://hop2.com'))
      .mockResolvedValueOnce(htmlResponse('Final content'));

    const result = await extractTextFromURL('https://start.com');

    expect(mockValidateExternalUrl).toHaveBeenCalledTimes(3);
    expect(mockValidateExternalUrl).toHaveBeenCalledWith('https://start.com');
    expect(mockValidateExternalUrl).toHaveBeenCalledWith('https://hop1.com/');
    expect(mockValidateExternalUrl).toHaveBeenCalledWith('https://hop2.com/');
    expect(result).toContain('Final content');
  });

  it('throws on too many redirects (>5 hops)', async () => {
    // 6 consecutive redirects
    for (let i = 0; i < 6; i++) {
      mockFetch.mockResolvedValueOnce(
        redirectResponse(`https://hop${i + 1}.com`)
      );
    }

    await expect(
      extractTextFromURL('https://redirect-loop.com')
    ).rejects.toThrow('Too many redirects');
  });

  it('throws when redirect has no Location header', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(null, { status: 302 }) // no Location header
    );

    await expect(
      extractTextFromURL('https://broken-redirect.com')
    ).rejects.toThrow('no Location header');
  });

  it('resolves relative redirect URLs against current URL', async () => {
    mockFetch
      .mockResolvedValueOnce(redirectResponse('/new-path'))
      .mockResolvedValueOnce(htmlResponse('Resolved content'));

    await extractTextFromURL('https://example.com/old-path');

    // Second validation should be the resolved absolute URL
    expect(mockValidateExternalUrl).toHaveBeenCalledWith(
      'https://example.com/new-path'
    );
  });
});

// ── Response size limit tests ────────────────────────────────────────────

/**
 * Build a Response whose body streams `totalBytes` of data in chunks.
 * Optionally set a Content-Length header.
 */
function streamingResponse(
  totalBytes: number,
  opts: { contentLength?: number } = {}
): Response {
  const chunkSize = 64 * 1024; // 64 KB per chunk
  let sent = 0;

  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= totalBytes) {
        controller.close();
        return;
      }
      const size = Math.min(chunkSize, totalBytes - sent);
      controller.enqueue(new Uint8Array(size).fill(65)); // 'A'
      sent += size;
    }
  });

  const headers: Record<string, string> = { 'Content-Type': 'text/html' };
  if (opts.contentLength !== undefined) {
    headers['Content-Length'] = String(opts.contentLength);
  }

  return new Response(stream, { status: 200, headers });
}

describe('extractTextFromURL — response size limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateExternalUrl.mockResolvedValue(undefined);
  });

  it('accepts a response under the 5 MB limit', async () => {
    // 100 KB is well under the limit
    mockFetch.mockResolvedValueOnce(
      streamingResponse(100 * 1024)
    );

    // Should not throw
    await expect(
      extractTextFromURL('https://normal-page.com')
    ).resolves.toBeDefined();
  });

  it('rejects response when Content-Length exceeds limit', async () => {
    // Body is empty but Content-Length header claims 10 MB
    const resp = new Response('<html><body>small</body></html>', {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Length': String(10 * 1024 * 1024)
      }
    });
    mockFetch.mockResolvedValueOnce(resp);

    await expect(
      extractTextFromURL('https://huge-header.com')
    ).rejects.toThrow(/Response too large.*Content-Length/);
  });

  it('rejects response that streams more than 5 MB (no Content-Length)', async () => {
    // 6 MB streamed with no Content-Length header
    mockFetch.mockResolvedValueOnce(
      streamingResponse(6 * 1024 * 1024)
    );

    await expect(
      extractTextFromURL('https://streaming-bomb.com')
    ).rejects.toThrow(/Response too large.*body exceeds/);
  });

  it('rejects even when Content-Length lies (says small, sends large)', async () => {
    // Content-Length says 1 KB, but body actually streams 6 MB
    mockFetch.mockResolvedValueOnce(
      streamingResponse(6 * 1024 * 1024, { contentLength: 1024 })
    );

    await expect(
      extractTextFromURL('https://lying-header.com')
    ).rejects.toThrow(/Response too large.*body exceeds/);
  });

  it('error message includes the byte limit value', async () => {
    mockFetch.mockResolvedValueOnce(
      streamingResponse(6 * 1024 * 1024)
    );

    await expect(
      extractTextFromURL('https://over-limit.com')
    ).rejects.toThrow(String(MAX_RESPONSE_BYTES));
  });
});
