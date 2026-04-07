import { describe, it, expect } from 'vitest';
import { validateMagicBytes } from '@/lib/security/magic-bytes';

describe('validateMagicBytes', () => {
  it('accepts valid PDF magic bytes', () => {
    // %PDF
    const buf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
    expect(validateMagicBytes(buf, 'application/pdf')).toBe(true);
  });

  it('rejects invalid PDF magic bytes', () => {
    // Not a PDF — starts with PK (zip signature)
    const buf = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]);
    expect(validateMagicBytes(buf, 'application/pdf')).toBe(false);
  });

  it('accepts valid PNG magic bytes', () => {
    const buf = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00
    ]);
    expect(validateMagicBytes(buf, 'image/png')).toBe(true);
  });

  it('rejects spoofed PNG (EXE disguised as PNG)', () => {
    // MZ header (PE executable)
    const buf = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    expect(validateMagicBytes(buf, 'image/png')).toBe(false);
  });

  it('accepts valid JPEG magic bytes', () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(validateMagicBytes(buf, 'image/jpeg')).toBe(true);
  });

  it('rejects invalid JPEG magic bytes', () => {
    const buf = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    expect(validateMagicBytes(buf, 'image/jpeg')).toBe(false);
  });

  it('accepts valid WebP magic bytes', () => {
    // RIFF....WEBP
    const buf = Buffer.alloc(16);
    buf.write('RIFF', 0);
    buf.writeUInt32LE(100, 4); // file size
    buf.write('WEBP', 8);
    expect(validateMagicBytes(buf, 'image/webp')).toBe(true);
  });

  it('rejects invalid WebP (missing WEBP at offset 8)', () => {
    const buf = Buffer.alloc(16);
    buf.write('RIFF', 0);
    buf.writeUInt32LE(100, 4);
    buf.write('AVI ', 8); // AVI, not WEBP
    expect(validateMagicBytes(buf, 'image/webp')).toBe(false);
  });

  it('accepts valid DOCX/XLSX (ZIP) magic bytes', () => {
    const buf = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
    expect(
      validateMagicBytes(
        buf,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
    ).toBe(true);
    expect(
      validateMagicBytes(
        buf,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
    ).toBe(true);
  });

  it('accepts valid DOC (OLE) magic bytes', () => {
    const buf = Buffer.from([
      0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00
    ]);
    expect(validateMagicBytes(buf, 'application/msword')).toBe(true);
  });

  it('allows text/plain without magic byte check', () => {
    const buf = Buffer.from('Hello, world!');
    expect(validateMagicBytes(buf, 'text/plain')).toBe(true);
  });

  it('allows text/csv without magic byte check', () => {
    const buf = Buffer.from('name,value\nfoo,bar');
    expect(validateMagicBytes(buf, 'text/csv')).toBe(true);
  });

  it('rejects when buffer is too short for the signature', () => {
    const buf = Buffer.from([0x25]); // Only 1 byte, PDF needs 4
    expect(validateMagicBytes(buf, 'application/pdf')).toBe(false);
  });

  it('allows unknown MIME types without signatures', () => {
    const buf = Buffer.from([0x00, 0x00]);
    expect(validateMagicBytes(buf, 'application/octet-stream')).toBe(true);
  });
});
