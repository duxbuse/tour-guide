import { PrismaClient } from '@prisma/client'

// Hack for local dev with SQLite
process.env.DATABASE_URL = 'file:./dev.db';

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const db = globalThis.prisma ?? prismaClientSingleton()

export default db

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
