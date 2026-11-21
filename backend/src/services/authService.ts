import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { config } from '../config/index.js';
import { Role } from '@prisma/client';

export class AuthService {
  public static async register(data: {
    fullName: string;
    email: string;
    password: string;
    role: Role;
    institutionName?: string;
    institutionCode?: string;
    studentNumber?: string;
    department?: string;
    graduationYear?: number;
    organizationName?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash,
        role: data.role,
      },
    });

    if (data.role === 'UNIVERSITY' && data.institutionName) {
      await prisma.institution.create({
        data: {
          userId: user.id,
          institutionName: data.institutionName,
          institutionCode: data.institutionCode || 'UNIV',
          officialEmail: data.email,
          website: 'https://iitd.ac.in',
          walletAddress: '0x0000000000000000000000000000000000000000',
        },
      });
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  public static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        institution: true,
        student: true,
      },
    });

    if (!user) {
      throw new Error('Invalid email or password credentials.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password credentials.');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  public static generateToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        institutionId: user.institution?.id,
        studentId: user.student?.id,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );
  }
}

