import crypto from 'crypto';

/**
 * Calculates SHA-256 fingerprint over exact raw file bytes.
 * Result is a 32-byte hex string (with '0x' prefix).
 */
export function calculateDocumentHash(fileBuffer: Buffer): string {
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  return `0x${hash}`;
}

/**
 * Computes deterministic canonical SHA-256 hash of metadata object (RFC 8785 compliant canonicalization).
 * Keys are sorted recursively to ensure identical hashes regardless of object key order.
 */
export function calculateMetadataHash(metadata: Record<string, any>): string {
  const canonicalString = canonicalizeJson(metadata);
  const hash = crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
  return `0x${hash}`;
}

/**
 * Helper to canonicalize JSON deterministically.
 */
export function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalizeJson).join(',')}]`;
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((key) => {
    return `${JSON.stringify(key)}:${canonicalizeJson(obj[key])}`;
  });

  return `{${pairs.join(',')}}`;
}

/**
 * Validates that file buffer has actual PDF magic bytes: '%PDF-' (0x25 0x50 0x44 0x46 0x2D).
 */
export function validatePdfMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 5) return false;
  return (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46 && // F
    buffer[4] === 0x2d    // -
  );
}

/**
 * Converts a 32-byte hex string (with or without 0x) to a clean bytes32 format.
 */
export function toBytes32(hexString: string): string {
  let clean = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
  if (clean.length > 64) {
    clean = clean.slice(0, 64);
  } else if (clean.length < 64) {
    clean = clean.padStart(64, '0');
  }
  return `0x${clean}`;
}

