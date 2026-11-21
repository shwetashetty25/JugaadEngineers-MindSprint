import { Router } from 'express';
import { authRouter } from './authRoutes.js';
import { walletRouter } from './walletRoutes.js';
import { credentialRouter } from './credentialRoutes.js';
import { verificationRouter } from './verificationRoutes.js';
import { institutionRouter } from './institutionRoutes.js';
import { studentRouter } from './studentRoutes.js';
import { auditRouter } from './auditRoutes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/wallet', walletRouter);
apiRouter.use('/credentials', credentialRouter);
apiRouter.use('/verification', verificationRouter);
apiRouter.use('/institutions', institutionRouter);
apiRouter.use('/students', studentRouter);
apiRouter.use('/audit', auditRouter);

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'VERIDEGREE X',
    version: '1.0.0',
    network: 'Ethereum Sepolia',
    timestamp: new Date().toISOString(),
  });
});

