import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { User } from '../types/user.types';

const prisma = new PrismaClient();

export class UserService {
  async createUser(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUser(user: { id: string; name: string; email: string; password: string }) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    return prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });
  }

  // 사용자 역할 업데이트
  async updateUserRole(userId: string, role: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { role }
    });
  }

  async setResetToken(email: string, token: string, expiry: Date) {
    return prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });
  }

  // 토큰으로 사용자 찾기
  async findByResetToken(token: string) {
    return prisma.user.findFirst({
      where: { resetToken: token },
    });
  }

  // 비밀번호 변경 및 토큰 무효화
  async updatePasswordAndClearToken(userId: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }
} 