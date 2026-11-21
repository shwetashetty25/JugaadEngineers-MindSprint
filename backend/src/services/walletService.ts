import crypto from 'crypto';
import { ethers } from 'ethers';

// In-memory or database nonce store
interface NonceEntry {
  nonce: string;
  walletAddress: string;
  message: string;
  expiresAt: Date;
  used: boolean;
}

const nonceCache = new Map<string, NonceEntry>();

export class WalletService {
  /**
   * Generates a secure random 32-character hex nonce with 5-minute expiry.
   */
  public static generateNonce(walletAddress: string): { nonce: string; message: string; expiresAt: Date } {
    const cleanAddress = ethers.getAddress(walletAddress);
    const nonce = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    const issuedAt = new Date().toISOString();

    const message = `veridegree-x.network wants you to sign in with your Ethereum account:\n${cleanAddress}\n\nSign this message to link your institutional wallet to VeriDegree X.\n\nURI: https://veridegree-x.network\nVersion: 1\nChain ID: 11155111\nNonce: ${nonce}\nIssued At: ${issuedAt}`;

    nonceCache.set(`${cleanAddress.toLowerCase()}_${nonce}`, {
      nonce,
      walletAddress: cleanAddress,
      message,
      expiresAt,
      used: false,
    });

    return { nonce, message, expiresAt };
  }

  /**
   * Verifies an EIP-191 personal_sign signature against the stored nonce and address.
   */
  public static verifySignature(
    walletAddress: string,
    signature: string,
    nonce: string
  ): { valid: boolean; error?: string } {
    try {
      const cleanAddress = ethers.getAddress(walletAddress);
      const cacheKey = `${cleanAddress.toLowerCase()}_${nonce}`;
      const entry = nonceCache.get(cacheKey);

      if (!entry) {
        return { valid: false, error: 'Nonce not found or expired. Please request a new nonce.' };
      }

      if (entry.used) {
        return { valid: false, error: 'Nonce has already been used (replay prevented).' };
      }

      if (new Date() > entry.expiresAt) {
        nonceCache.delete(cacheKey);
        return { valid: false, error: 'Nonce has expired. Please try again.' };
      }

      // Recover the signer address using ethers
      const recoveredSigner = ethers.verifyMessage(entry.message, signature);

      if (recoveredSigner.toLowerCase() !== cleanAddress.toLowerCase()) {
        return { valid: false, error: 'Signature does not match the claiming wallet address.' };
      }

      // Mark nonce as used (keep in cache until expiry to catch explicit replay)
      entry.used = true;

      return { valid: true };
    } catch (e: any) {
      return { valid: false, error: e.message || 'Signature verification failed' };
    }
  }
}
