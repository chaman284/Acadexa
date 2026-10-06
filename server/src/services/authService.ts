import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { config } from '../config';

export const authService = {
  async register(data: {
    email: string;
    password: string;
    name: string;
    role: 'STUDENT' | 'FACULTY' | 'ADMIN';
    rollNo?: string;
    sectionId?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
        ...(data.role === 'STUDENT' && data.rollNo && data.sectionId
          ? {
              student: {
                create: {
                  rollNo: data.rollNo,
                  sectionId: data.sectionId,
                },
              },
            }
          : {}),
        ...(data.role === 'FACULTY'
          ? {
              faculty: {
                create: {},
              },
            }
          : {}),
      },
      include: {
        student: true,
        faculty: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        student: user.student,
        faculty: user.faculty,
      },
      token,
    };
  },

  async login(email: string, password: string, role?: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        faculty: true,
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (role && user.role !== role) {
      throw new Error(`Invalid role. Account registered as ${user.role}`);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        student: user.student,
        faculty: user.faculty,
      },
      token,
    };
  },

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            section: {
              include: {
                department: true,
              },
            },
          },
        },
        faculty: {
          include: {
            assignments: {
              include: {
                subject: true,
                section: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },
};
