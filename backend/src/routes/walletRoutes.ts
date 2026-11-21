import { Router, Request, Response, NextFunction } from 'express';
import { WalletService } from '../services/walletService.js';
import { walletNonceSchema, walletVerifySchema } from '../validators/index.js';
import { authenticate } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { prisma } from '../config/prisma.js';

export const walletRouter = Router();

// 1. Request cryptographic nonce
walletRouter.post('/nonce', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = walletNonceSchema.parse(req.body);
    const nonceData = WalletService.generateNonce(walletAddress);
    return res.json(nonceData);
  } catch (err) {
    next(err);
  }
});

// 2. Verify signature and link wallet to account
walletRouter.post('/verify-signature', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { walletAddress, signature, nonce } = walletVerifySchema.parse(req.body);

    const verification = WalletService.verifySignature(walletAddress, signature, nonce);
    if (!verification.valid) {
      return res.status(400).json({ error: verification.error });
    }

    // Link wallet to authenticated user
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: { walletAddress },
    });

    // If user is university, update institution record
    if (req.user!.role === 'UNIVERSITY') {
      await prisma.institution.updateMany({
        where: { userId: req.user!.id },
        data: { walletAddress },
      });
    }

    return res.json({
      success: true,
      message: 'Wallet signature verified and linked successfully.',
      walletAddress: updatedUser.walletAddress,
    });
  } catch (err) {
    next(err);
  }
});

// 3. Get wallet linking status
walletRouter.get('/status', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { institution: true },
    });
    return res.json({
      walletAddress: user?.walletAddress || null,
      isLinked: !!user?.walletAddress,
      blockchainRegistered: user?.institution?.blockchainRegistered || false,
    });
  } catch (err) {
    next(err);
  }
});

