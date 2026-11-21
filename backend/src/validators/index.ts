import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['UNIVERSITY', 'STUDENT', 'RECRUITER']),
  institutionName: z.string().optional(),
  institutionCode: z.string().optional(),
  studentNumber: z.string().optional(),
  department: z.string().optional(),
  graduationYear: z.number().int().optional(),
  organizationName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const walletNonceSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

export const walletVerifySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/, 'Invalid signature format'),
  nonce: z.string().min(8),
});

export const prepareCredentialSchema = z.object({
  credentialId: z.string().min(4).max(64),
  studentId: z.string().uuid().optional(),
  studentNumber: z.string().min(1),
  studentName: z.string().min(1),
  degreeName: z.string().min(2),
  department: z.string().min(2),
  graduationYear: z.coerce.number().int(),
  grade: z.string().min(1),
  issueDate: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const confirmIssuanceSchema = z.object({
  credentialId: z.string().min(4),
  blockchainTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
});

export const prepareRevocationSchema = z.object({
  reason: z.string().min(3).max(500),
});

export const confirmRevocationSchema = z.object({
  blockchainTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  reason: z.string().min(3),
});

export const verifyCredentialSchema = z.object({
  credentialId: z.string().min(1),
  verificationMethod: z.enum(['QR_SCAN', 'MANUAL_ID', 'API']).default('MANUAL_ID'),
});

