import { PrismaClient } from '@prisma/client';

describe('Prisma Client', () => {
  it('can be instantiated', () => {
    const prisma = new PrismaClient();
    expect(prisma).toBeDefined();
    expect(typeof prisma.user.findMany).toBe('function');
  });
}); 