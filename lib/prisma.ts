import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection pool.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices
let prisma: PrismaClient;

if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    if (!global.__db) {
      global.__db = new PrismaClient();
    }
    prisma = global.__db;
  }
} else {
  // In the browser, we don't need a Prisma client.
  prisma = new PrismaClient();
}

export { prisma };