import {
  calculateDocumentHash,
  calculateMetadataHash,
  validatePdfMagicBytes,
  canonicalizeJson,
} from '../src/utils/hashing';

describe('Document & Metadata Hashing Protocol Tests', () => {
  it('should correctly validate PDF magic bytes %PDF-', () => {
    const validPdfBuffer = Buffer.from('%PDF-1.7\nSample content');
    const invalidBuffer = Buffer.from('NOT_A_PDF_DOCUMENT');

    expect(validatePdfMagicBytes(validPdfBuffer)).toBe(true);
    expect(validatePdfMagicBytes(invalidBuffer)).toBe(false);
  });

  it('should compute exact deterministic SHA-256 binary hash', () => {
    const sampleBytes = Buffer.from('ACADEMIC_DEGREE_TRANSCRIPT_CONTENT');
    const hash1 = calculateDocumentHash(sampleBytes);
    const hash2 = calculateDocumentHash(sampleBytes);

    expect(hash1).toBe(hash2);
    expect(hash1.startsWith('0x')).toBe(true);
    expect(hash1.length).toBe(66); // 0x + 64 hex chars = 32 bytes
  });

  it('should canonicalize metadata deterministically regardless of key order', () => {
    const metaA = { degree: 'B.Tech', student: 'Aarav Sharma', year: 2024 };
    const metaB = { year: 2024, student: 'Aarav Sharma', degree: 'B.Tech' };

    const canonA = canonicalizeJson(metaA);
    const canonB = canonicalizeJson(metaB);
    expect(canonA).toBe(canonB);

    const hashA = calculateMetadataHash(metaA);
    const hashB = calculateMetadataHash(metaB);
    expect(hashA).toBe(hashB);
  });

  it('should produce different hash for even 1-bit alteration (Tamper Evident)', () => {
    const original = { cgpa: '9.62', student: 'Aarav Sharma' };
    const tampered = { cgpa: '9.63', student: 'Aarav Sharma' };

    const hashOriginal = calculateMetadataHash(original);
    const hashTampered = calculateMetadataHash(tampered);

    expect(hashOriginal).not.toBe(hashTampered);
  });
});

