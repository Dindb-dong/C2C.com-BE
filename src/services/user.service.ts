
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
} 