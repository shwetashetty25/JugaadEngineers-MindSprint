import { Router, Request, Response, NextFunction } from 'express';
import { VerificationService } from '../services/verificationService.js';
import { verifyCredentialSchema } from '../validators/index.js';
import { prisma } from '../config/prisma.js';

export const verificationRouter = Router();

// Public verification endpoint (Does not require login, returns privacy-safe cryptographic evidence)
verificationRouter.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credentialId, verificationMethod } = verifyCredentialSchema.parse(req.body);

    const result = await VerificationService.verifyCredential(
      credentialId,
      undefined,
      verificationMethod as any
    );

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// Verification history
verificationRouter.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.verificationLog.findMany({
      take: 50,
      orderBy: { verifiedAt: 'desc' },
      include: {
        credential: {
          include: {
            institution: true,
            student: { include: { user: true } },
          },
        },
      },
    });

    return res.json({ history: logs });
  } catch (err) {
    next(err);
  }
});

