import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { registerSchema, loginSchema } from '../validators/index.js';
import { authenticate } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = registerSchema.parse(req.body);
    const result = await AuthService.register(validated as any);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await AuthService.login(validated.email, validated.password);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

authRouter.post('/logout', (req: Request, res: Response) => {
  return res.json({ message: 'Successfully logged out.' });
});

