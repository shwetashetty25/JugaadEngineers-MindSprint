import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { prisma } from '../config/prisma.js';

export const institutionRouter = Router();

// Get logged-in university's institutional record
institutionRouter.get('/me', authenticate, authorizeRoles('UNIVERSITY', 'ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const institution = await prisma.institution.findFirst({
      where: { userId: req.user!.id },
      include: {
        _count: {
          select: {
            credentials: true,
            students: true,
          },
        },
      },
    });

    if (!institution) {
      return res.status(404).json({ error: 'Institution not found.' });
    }

    return res.json({ institution });
  } catch (err) {
    next(err);
  }
});

// Update institutional profile
institutionRouter.patch('/me', authenticate, authorizeRoles('UNIVERSITY', 'ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { officialEmail, website, country, walletAddress } = req.body;

    const updated = await prisma.institution.updateMany({
      where: { userId: req.user!.id },
      data: {
        ...(officialEmail ? { officialEmail } : {}),
        ...(website ? { website } : {}),
        ...(country ? { country } : {}),
        ...(walletAddress ? { walletAddress } : {}),
      },
    });

    return res.json({ success: true, updated });
  } catch (err) {
    next(err);
  }
});

// Get university students
institutionRouter.get('/students', authenticate, authorizeRoles('UNIVERSITY', 'ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const institution = await prisma.institution.findFirst({
      where: { userId: req.user!.id },
    });
    if (!institution) return res.status(404).json({ error: 'Institution not found.' });

    const students = await prisma.student.findMany({
      where: { institutionId: institution.id },
      include: {
        user: true,
        credentials: true,
      },
    });

    return res.json({ students });
  } catch (err) {
    next(err);
  }
});

