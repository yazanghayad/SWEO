/**
 * @vitest-environment node
 *
 * URL Validator tests run in Node environment (not jsdom) so
 * dns/promises can be properly mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { dnsLookupMock } = vi.hoisted(() => ({
  dnsLookupMock: vi.fn()
}));

vi.mock('dns/promises', () => ({
  lookup: dnsLookupMock
}));

import { validateExternalUrl } from '@/lib/security/url-validator';

describe('validateExternalUrl', () => {
  beforeEach(() => {
    dnsLookupMock.mockReset();
    // Default: resolve to a safe public IP
    dnsLookupMock.mockResolvedValue({ address: '93.184.216.34', family: 4 });
  });

  it('allows a valid public https URL', async () => {
    await expect(
      validateExternalUrl('https://example.com/page')
    ).resolves.toBeUndefined();
  });

  it('allows http protocol', async () => {
    await expect(
      validateExternalUrl('http://example.com')
    ).resolves.toBeUndefined();
  });

  it('rejects non-http protocols (ftp)', async () => {
    await expect(
      validateExternalUrl('ftp://example.com')
    ).rejects.toThrow('Blocked URL scheme');
  });

  it('rejects non-http protocols (file)', async () => {
    await expect(
      validateExternalUrl('file:///etc/passwd')
    ).rejects.toThrow('Blocked URL scheme');
  });

  it('rejects invalid URLs', async () => {
    await expect(
      validateExternalUrl('not-a-url')
    ).rejects.toThrow('Invalid URL');
  });

  it('rejects localhost hostname', async () => {
    await expect(
      validateExternalUrl('http://localhost:8080')
    ).rejects.toThrow('Blocked hostname');
  });

  it('rejects metadata.google.internal hostname', async () => {
    await expect(
      validateExternalUrl('http://metadata.google.internal/computeMetadata/v1/')
    ).rejects.toThrow('Blocked hostname');
  });

  it('rejects kubernetes.default.svc hostname', async () => {
    await expect(
      validateExternalUrl('http://kubernetes.default.svc/api')
    ).rejects.toThrow('Blocked hostname');
  });

  it('rejects URLs that resolve to RFC 1918 private IPs (10.x)', async () => {
    dnsLookupMock.mockResolvedValue({ address: '10.0.0.1', family: 4 });
    await expect(
      validateExternalUrl('https://evil.com')
    ).rejects.toThrow('blocked private IP');
  });

  it('rejects URLs that resolve to loopback (127.x)', async () => {
    dnsLookupMock.mockResolvedValue({ address: '127.0.0.1', family: 4 });
    await expect(
      validateExternalUrl('https://tricky.com')
    ).rejects.toThrow('blocked private IP');
  });

  it('rejects URLs that resolve to link-local / AWS metadata (169.254.x)', async () => {
    dnsLookupMock.mockResolvedValue({ address: '169.254.169.254', family: 4 });
    await expect(
      validateExternalUrl('https://metadata-steal.com')
    ).rejects.toThrow('blocked private IP');
  });

  it('rejects URLs that resolve to 192.168.x private range', async () => {
    dnsLookupMock.mockResolvedValue({ address: '192.168.1.1', family: 4 });
    await expect(
      validateExternalUrl('https://internal.com')
    ).rejects.toThrow('blocked private IP');
  });

  it('rejects URLs that resolve to CGN range (100.64.x)', async () => {
    dnsLookupMock.mockResolvedValue({ address: '100.64.0.1', family: 4 });
    await expect(
      validateExternalUrl('https://cgn.com')
    ).rejects.toThrow('blocked private IP');
  });

  it('rejects URLs that resolve to 172.16-31.x private range', async () => {
    dnsLookupMock.mockResolvedValue({ address: '172.16.0.1', family: 4 });
    await expect(
      validateExternalUrl('https://private172.com')
    ).rejects.toThrow('blocked private IP');
  });

  it('rejects when DNS resolution fails', async () => {
    dnsLookupMock.mockRejectedValue(new Error('ENOTFOUND nonexistent.com'));
    await expect(
      validateExternalUrl('https://nonexistent.com')
    ).rejects.toThrow('DNS resolution failed');
  });

  it('passes DNS check to verify resolved IP', async () => {
    dnsLookupMock.mockResolvedValue({ address: '203.0.113.50', family: 4 });
    await expect(
      validateExternalUrl('https://safe-site.com')
    ).resolves.toBeUndefined();
    expect(dnsLookupMock).toHaveBeenCalledWith('safe-site.com');
  });
});
