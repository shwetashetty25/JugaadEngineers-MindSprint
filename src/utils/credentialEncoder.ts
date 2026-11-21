import { ethers } from 'ethers';

/**
 * Normalizes a human-readable credential identifier (e.g. "VDX-2024-IITD-0891").
 * Trims whitespace and converts to uppercase for deterministic cross-client matching.
 */
export function normalizeCredentialId(rawId: string): string {
  return (rawId || '').trim().toUpperCase();
}

/**
 * Converts a normalized credential ID into a deterministic 32-byte hash for the smart contract.
 * - If already a standard 32-byte hex string (0x followed by 64 hex characters), it returns it directly.
 * - Otherwise, computes ethers.keccak256(ethers.toUtf8Bytes(normalizedId)).
 */
export function encodeCredentialIdToBytes32(id: string): string {
  const normalized = normalizeCredentialId(id);
  if (normalized.startsWith('0x') && normalized.length === 66 && ethers.isHexString(normalized, 32)) {
    return normalized.toLowerCase();
  }
  return ethers.keccak256(ethers.toUtf8Bytes(normalized));
}

