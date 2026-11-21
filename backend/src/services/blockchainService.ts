import { ethers } from 'ethers';
import { config } from '../config/index.js';
import { toBytes32 } from '../utils/hashing.js';

// Minimal ABI for AcademicCredentialRegistry read and event parsing
const REGISTRY_ABI = [
  'function verifyCredential(bytes32 credentialId) external view returns (bool exists, bool isAuthentic, bool isRevoked, address issuer, bytes32 documentHash, bytes32 metadataHash, uint256 issuedAt, uint256 revokedAt)',
  'function getCredential(bytes32 credentialId) external view returns (tuple(bytes32 credentialId, bytes32 documentHash, bytes32 metadataHash, address issuer, uint256 issuedAt, uint256 revokedAt, bytes32 revocationReason, bool exists, bool revoked))',
  'function isUniversityRegistered(address wallet) external view returns (bool)',
  'event CredentialIssued(bytes32 indexed credentialId, bytes32 indexed documentHash, bytes32 metadataHash, address indexed issuer, uint256 issuedAt)',
  'event CredentialRevoked(bytes32 indexed credentialId, bytes32 indexed reasonHash, address indexed revoker, uint256 revokedAt)',
  'event UniversityRegistered(address indexed wallet, bytes32 indexed institutionIdHash, uint256 timestamp)'
];

export interface OnChainCredentialStatus {
  exists: boolean;
  isAuthentic: boolean;
  isRevoked: boolean;
  issuer: string;
  documentHash: string;
  metadataHash: string;
  issuedAt: number;
  revokedAt: number;
}

export class BlockchainService {
  private static provider = new ethers.JsonRpcProvider(config.blockchain.sepoliaRpcUrl);

  public static getContract(address: string = config.blockchain.registryAddress) {
    return new ethers.Contract(address, REGISTRY_ABI, this.provider);
  }

  /**
   * Queries on-chain state for a given credential ID.
   */
  public static async readCredential(credentialId: string): Promise<OnChainCredentialStatus> {
    try {
      const bytesId = ethers.keccak256(ethers.toUtf8Bytes(credentialId));
      const contract = this.getContract();
      const res = await contract.verifyCredential(bytesId);

      return {
        exists: res[0],
        isAuthentic: res[1],
        isRevoked: res[2],
        issuer: res[3],
        documentHash: res[4],
        metadataHash: res[5],
        issuedAt: Number(res[6]),
        revokedAt: Number(res[7]),
      };
    } catch (e: any) {
      console.warn('[Blockchain Read Warning]:', e.message);
      return {
        exists: false,
        isAuthentic: false,
        isRevoked: false,
        issuer: ethers.ZeroAddress,
        documentHash: ethers.ZeroHash,
        metadataHash: ethers.ZeroHash,
        issuedAt: 0,
        revokedAt: 0,
      };
    }
  }

  /**
   * Independently verifies an issuance transaction receipt and checks for CredentialIssued event.
   */
  public static async verifyIssuanceReceipt(
    txHash: string,
    expectedCredentialId: string,
    expectedDocumentHash: string
  ): Promise<{ confirmed: boolean; blockNumber?: number; issuerAddress?: string; error?: string }> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        return { confirmed: false, error: 'Transaction receipt not yet available on Sepolia.' };
      }

      if (receipt.status !== 1) {
        return { confirmed: false, error: 'Transaction was reverted on-chain (status 0).' };
      }

      const iface = new ethers.Interface(REGISTRY_ABI);
      const targetCredId = ethers.keccak256(ethers.toUtf8Bytes(expectedCredentialId));

      let matched = false;
      let issuer = '';

      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === 'CredentialIssued') {
            if (parsed.args.credentialId === targetCredId) {
              matched = true;
              issuer = parsed.args.issuer;
              break;
            }
          }
        } catch {
          // Ignore logs from other contracts
        }
      }

      if (!matched) {
        return {
          confirmed: false,
          error: 'Transaction succeeded but did not emit CredentialIssued event for this credential ID.',
        };
      }

      return {
        confirmed: true,
        blockNumber: receipt.blockNumber,
        issuerAddress: issuer,
      };
    } catch (e: any) {
      return { confirmed: false, error: e.message || 'Failed to verify transaction receipt' };
    }
  }

  /**
   * Independently verifies a revocation transaction receipt.
   */
  public static async verifyRevocationReceipt(
    txHash: string,
    expectedCredentialId: string
  ): Promise<{ confirmed: boolean; blockNumber?: number; error?: string }> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        return { confirmed: false, error: 'Transaction receipt not yet available.' };
      }
      if (receipt.status !== 1) {
        return { confirmed: false, error: 'Revocation transaction failed on-chain.' };
      }

      return { confirmed: true, blockNumber: receipt.blockNumber };
    } catch (e: any) {
      return { confirmed: false, error: e.message };
    }
  }
}

