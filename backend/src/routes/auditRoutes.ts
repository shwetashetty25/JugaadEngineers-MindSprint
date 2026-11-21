import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { prisma } from '../config/prisma.js';

export const auditRouter = Router();

auditRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { actorUserId: req.user!.id },
      take: 50,
      orderBy: { timestamp: 'desc' },
    });
    return res.json({ auditLogs: logs });
  } catch (err) {
    next(err);
  }
});

