// src/prisma.ts
import { PrismaClient } from '@prisma/client';

console.log('Initializing Prisma client...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch((error: Error) => {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  });

export default prisma;