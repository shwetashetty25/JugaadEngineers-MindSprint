import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  walletAddress?: string | null;
  institutionId?: string | null;
  studentId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

