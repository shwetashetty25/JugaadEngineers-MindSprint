import { prisma } from '../config/prisma.js';
import { BlockchainService, OnChainCredentialStatus } from './blockchainService.js';
import { ethers } from 'ethers';

export type VerificationResult = 'VERIFIED' | 'REVOKED' | 'INVALID' | 'NOT_FOUND' | 'PENDING';

export interface VerificationResponse {
  result: VerificationResult;
  credentialId: string;
  isAuthentic: boolean;
  degreeName?: string;
  institutionName?: string;
  institutionCode?: string;
  department?: string;
  graduationYear?: number;
  issueDate?: string;
  studentName?: string;
  onChainDetails: {
    exists: boolean;
    revoked: boolean;
    issuerWallet: string;
    documentHash: string;
    metadataHash: string;
    issuedTimestamp?: number;
    revokedTimestamp?: number;
    blockchainNetwork: string;
  };
  revocationDecree?: {
    revokedAt: string;
    reason: string;
  };
  auditTimestamp: string;
}

export class VerificationService {
  public static async verifyCredential(
    credentialId: string,
    verifierUserId?: string,
    method: 'QR_SCAN' | 'MANUAL_ID' | 'API' = 'MANUAL_ID'
  ): Promise<VerificationResponse> {
    const cleanId = credentialId.trim().toUpperCase();

    // 1. Fetch DB record with relations
    const dbRecord = await prisma.credential.findUnique({
      where: { credentialId: cleanId },
      include: {
        institution: true,
        student: { include: { user: true } },
      },
    });

    // 2. Query Ethereum Sepolia Smart Contract via JSON-RPC
    const onChain: OnChainCredentialStatus = await BlockchainService.readCredential(cleanId);

    let result: VerificationResult = 'NOT_FOUND';
    let isAuthentic = false;

    if (!onChain.exists) {
      if (dbRecord && dbRecord.status === 'PENDING') {
        result = 'PENDING';
      } else {
        result = 'NOT_FOUND';
      }
    } else if (onChain.isRevoked || (dbRecord && dbRecord.status === 'REVOKED')) {
      result = 'REVOKED';
      isAuthentic = false;
    } else {
      // Cross-check on-chain hashes and issuer
      if (dbRecord) {
        const issuerMatches =
          dbRecord.institution.walletAddress.toLowerCase() === onChain.issuer.toLowerCase();
        const docHashMatches =
          dbRecord.documentHash.toLowerCase() === onChain.documentHash.toLowerCase();

        if (issuerMatches && docHashMatches && onChain.isAuthentic) {
          result = 'VERIFIED';
          isAuthentic = true;
        } else {
          result = 'INVALID';
          isAuthentic = false;
        }
      } else {
        // Exists on-chain but not in local DB (issued through contract directly)
        result = onChain.isAuthentic ? 'VERIFIED' : 'INVALID';
        isAuthentic = onChain.isAuthentic;
      }
    }

    // 3. Log audit record in PostgreSQL
    try {
      if (dbRecord) {
        await prisma.verificationLog.create({
          data: {
            credentialId: cleanId,
            verifierUserId: verifierUserId || null,
            verificationResult: result,
            verificationMethod: method,
            transactionHash: dbRecord.blockchainTxHash || null,
          },
        });
      }
    } catch (e) {
      console.warn('Could not record verification log:', e);
    }

    return {
      result,
      credentialId: cleanId,
      isAuthentic,
      degreeName: dbRecord?.degreeName,
      institutionName: dbRecord?.institution.institutionName,
      institutionCode: dbRecord?.institution.institutionCode,
      department: dbRecord?.department,
      graduationYear: dbRecord?.graduationYear,
      issueDate: dbRecord?.issueDate.toISOString().split('T')[0],
      studentName: dbRecord?.student.user?.fullName || dbRecord?.student.fullName,
      onChainDetails: {
        exists: onChain.exists,
        revoked: onChain.isRevoked,
        issuerWallet: onChain.issuer,
        documentHash: onChain.documentHash,
        metadataHash: onChain.metadataHash,
        issuedTimestamp: onChain.issuedAt,
        revokedTimestamp: onChain.revokedAt,
        blockchainNetwork: 'Ethereum Sepolia Testnet (EIP-155:11155111)',
      },
      revocationDecree: dbRecord?.revokedAt
        ? {
            revokedAt: dbRecord.revokedAt.toISOString(),
            reason: dbRecord.revocationReason || 'Revoked by Institutional Senate decree',
          }
        : undefined,
      auditTimestamp: new Date().toISOString(),
    };
  }
}

