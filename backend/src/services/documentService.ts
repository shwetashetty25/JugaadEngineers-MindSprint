import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { calculateDocumentHash, validatePdfMagicBytes } from '../utils/hashing.js';
import { config } from '../config/index.js';

export class DocumentService {
  private static storageDir = path.resolve(config.storagePath);
  private static encryptionKey = crypto.createHash('sha256').update(config.encryptionKey).digest();

  private static ensureStorageDir() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Processes uploaded degree PDF:
   * 1. Validates magic bytes
   * 2. Computes unforgeable SHA-256 binary hash
   * 3. Encrypts PDF using AES-256-GCM
   * 4. Saves to private object store and returns storageKey and documentHash
   */
  public static processAndStorePdf(
    fileBuffer: Buffer,
    originalFilename: string
  ): { documentHash: string; storageKey: string; fileSizeBytes: number } {
    if (!validatePdfMagicBytes(fileBuffer)) {
      throw new Error('Invalid file format: Uploaded file is not a valid PDF document (missing %PDF- signature).');
    }

    if (fileBuffer.length > 15 * 1024 * 1024) {
      throw new Error('File too large: Academic documents must not exceed 15MB.');
    }

    // 1. Calculate raw document SHA-256 hash
    const documentHash = calculateDocumentHash(fileBuffer);

    // 2. Encrypt at rest using AES-256-GCM
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    const tag = cipher.getAuthTag();

    // 3. Package IV + Tag + Ciphertext
    const storageKey = `doc_${crypto.randomBytes(16).toString('hex')}.enc`;
    this.ensureStorageDir();
    const filePath = path.join(this.storageDir, storageKey);

    const packedBuffer = Buffer.concat([iv, tag, encrypted]);
    fs.writeFileSync(filePath, packedBuffer);

    return {
      documentHash,
      storageKey,
      fileSizeBytes: fileBuffer.length,
    };
  }

  /**
   * Decrypts and retrieves document for authorized student/university downloads.
   */
  public static retrieveDecryptedDocument(storageKey: string): Buffer {
    this.ensureStorageDir();
    const filePath = path.join(this.storageDir, storageKey);
    if (!fs.existsSync(filePath)) {
      throw new Error('Document not found in secure storage.');
    }

    const packedBuffer = fs.readFileSync(filePath);
    if (packedBuffer.length < 28) {
      throw new Error('Corrupt encrypted document.');
    }

    const iv = packedBuffer.subarray(0, 12);
    const tag = packedBuffer.subarray(12, 28);
    const encrypted = packedBuffer.subarray(28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }
}

