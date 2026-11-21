import { Router, Response, NextFunction } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { prisma } from '../config/prisma.js';

export const studentRouter = Router();

// Get student's own profile and credentials
studentRouter.get('/me', authenticate, authorizeRoles('STUDENT'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: true,
        institution: true,
        credentials: {
          orderBy: { issueDate: 'desc' },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    return res.json({ student });
  } catch (err) {
    next(err);
  }
});

// Get student's credential verification logs
studentRouter.get('/me/history', authenticate, authorizeRoles('STUDENT'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
      include: { credentials: true },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    const credIds = student.credentials.map((c) => c.credentialId);

    const logs = await prisma.verificationLog.findMany({
      where: { credentialId: { in: credIds } },
      orderBy: { verifiedAt: 'desc' },
      include: { verifier: true },
    });

    return res.json({ history: logs });
  } catch (err) {
    next(err);
  }
});

