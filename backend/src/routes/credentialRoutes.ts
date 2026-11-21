import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { DocumentService } from '../services/documentService.js';
import { CredentialService } from '../services/credentialService.js';
import {
  prepareCredentialSchema,
  confirmIssuanceSchema,
  confirmRevocationSchema,
} from '../validators/index.js';
import { prisma } from '../config/prisma.js';
import { ethers } from 'ethers';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

export const credentialRouter = Router();

// 1. Prepare Credential Issuance (Upload PDF + Calculate Hashes + DB Pending)
credentialRouter.post(
  '/prepare',
  authenticate,
  authorizeRoles('UNIVERSITY', 'ADMIN'),
  upload.single('degreePdf'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Degree PDF file is required.' });
      }

      // 1. Process and store PDF securely
      const { documentHash, storageKey, fileSizeBytes } = DocumentService.processAndStorePdf(
        req.file.buffer,
        req.file.originalname
      );

      // 2. Validate form fields
      const body = prepareCredentialSchema.parse(req.body);

      // 3. Find user's institution
      const institution = await prisma.institution.findFirst({
        where: { userId: req.user!.id },
      });
      if (!institution) {
        return res.status(403).json({ error: 'No authorized institution record associated with user.' });
      }

      const result = await CredentialService.prepareIssuance({
        credentialId: body.credentialId.trim().toUpperCase(),
        institutionId: institution.id,
        studentNumber: body.studentNumber,
        studentName: body.studentName,
        degreeName: body.degreeName,
        department: body.department,
        graduationYear: body.graduationYear,
        grade: body.grade,
        issueDate: new Date(body.issueDate),
        documentHash,
        storageKey,
        metadata: body.metadata,
        issuerWallet: institution.walletAddress,
      });

      return res.status(200).json({
        success: true,
        documentHash,
        storageKey,
        fileSizeBytes,
        preparation: result.blockchainPreparation,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 2. Confirm On-Chain Issuance (After MetaMask Signs and Broadcasts Tx)
credentialRouter.post(
  '/confirm-issuance',
  authenticate,
  authorizeRoles('UNIVERSITY', 'ADMIN'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { credentialId, blockchainTxHash } = confirmIssuanceSchema.parse(req.body);

      const confirmed = await CredentialService.confirmIssuance(
        credentialId.trim().toUpperCase(),
        blockchainTxHash
      );

      return res.json({
        success: true,
        message: 'Credential successfully confirmed on Ethereum Sepolia ledger.',
        credential: confirmed,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 3. Prepare Revocation (Computes Reason Hash)
credentialRouter.post(
  '/:id/prepare-revocation',
  authenticate,
  authorizeRoles('UNIVERSITY', 'ADMIN'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const credentialId = req.params.id.trim().toUpperCase();
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: 'Revocation reason is required.' });
      }

      const bytesCredentialId = ethers.keccak256(ethers.toUtf8Bytes(credentialId));
      const bytesReasonHash = ethers.keccak256(ethers.toUtf8Bytes(reason));

      return res.json({
        credentialId,
        bytesCredentialId,
        bytesReasonHash,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 4. Confirm Revocation
credentialRouter.post(
  '/:id/confirm-revocation',
  authenticate,
  authorizeRoles('UNIVERSITY', 'ADMIN'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const credentialId = req.params.id.trim().toUpperCase();
      const { blockchainTxHash, reason } = confirmRevocationSchema.parse(req.body);

      const revoked = await CredentialService.confirmRevocation(
        credentialId,
        blockchainTxHash,
        reason
      );

      return res.json({
        success: true,
        message: 'Credential officially revoked on blockchain.',
        credential: revoked,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 5. Download Decrypted Degree (Authorized Student / University Only)
credentialRouter.get(
  '/:id/download',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const credentialId = req.params.id.trim().toUpperCase();
      const cred = await prisma.credential.findUnique({
        where: { credentialId },
        include: { student: true, institution: true },
      });

      if (!cred) {
        return res.status(404).json({ error: 'Credential not found.' });
      }

      // Check ownership
      const isOwner =
        (req.user!.role === 'STUDENT' && cred.student.userId === req.user!.id) ||
        (req.user!.role === 'UNIVERSITY' && cred.institution.userId === req.user!.id) ||
        req.user!.role === 'ADMIN';

      if (!isOwner) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to download this degree PDF.' });
      }

      const pdfBuffer = DocumentService.retrieveDecryptedDocument(cred.documentStorageKey);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${cred.credentialId}_Official_Degree.pdf"`);
      return res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
);

// 6. Get All Issued Credentials (with search and status filters)
credentialRouter.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { credentialId: { contains: search, mode: 'insensitive' } },
        { degreeName: { contains: search, mode: 'insensitive' } },
        { student: { user: { fullName: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const credentials = await prisma.credential.findMany({
      where,
      include: {
        student: { include: { user: true } },
        institution: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ credentials });
  } catch (err) {
    next(err);
  }
});

