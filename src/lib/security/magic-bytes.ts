/**
 * Magic-byte (file signature) validation.
 *
 * Validates that the first bytes of a file match the expected format,
 * preventing MIME-type spoofing attacks where a malicious file is
 * uploaded with a forged Content-Type header.
 */

interface MagicSignature {
  /** Byte offset from the start of the file. */
  offset: number;
  /** Expected bytes at that offset. */
  bytes: number[];
}

/**
 * Map of MIME types to their known magic-byte signatures.
 * Some formats have multiple valid signatures.
 */
const SIGNATURES: Record<string, MagicSignature[]> = {
  // PDF: %PDF
  'application/pdf': [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }],

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  'image/png': [
    { offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }
  ],

  // JPEG: FF D8 FF
  'image/jpeg': [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],

  // WebP: RIFF....WEBP
  'image/webp': [
    { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // "RIFF"
    { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] } // "WEBP"
  ],

  // MS Word legacy (.doc): D0 CF 11 E0 (OLE Compound File)
  'application/msword': [
    { offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] }
  ],

  // DOCX / XLSX: ZIP archive (PK signature)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    { offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }
  ],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
    { offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }
  ]

  // text/plain and text/csv have no magic bytes — validated separately
};

/**
 * Check whether the first bytes of a buffer match all required signatures
 * for a given MIME type.
 *
 * Returns `true` if:
 *  - the MIME type has no registered signatures (e.g. text/plain), OR
 *  - all registered byte patterns match at their specified offsets.
 */
export function validateMagicBytes(
  buffer: Buffer,
  mimeType: string
): boolean {
  const sigs = SIGNATURES[mimeType];

  // No signature defined for this type — allow (text/plain, text/csv)
  if (!sigs) return true;

  for (const sig of sigs) {
    const end = sig.offset + sig.bytes.length;
    if (buffer.length < end) return false;

    for (let i = 0; i < sig.bytes.length; i++) {
      if (buffer[sig.offset + i] !== sig.bytes[i]) {
        return false;
      }
    }
  }

  return true;
}
