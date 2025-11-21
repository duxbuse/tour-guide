import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  try {
    // In production (Vercel), make sure we have a database URL
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not set, using fallback for build time')
      return {} as PrismaClient
    }

    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  } catch (error) {
    console.warn('Failed to initialize Prisma Client:', error)
    // Return a mock client during build/runtime issues
    return {} as PrismaClient
  }
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const db = globalThis.prisma ?? prismaClientSingleton()

export default db

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
