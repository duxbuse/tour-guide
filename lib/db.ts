import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // Log environment state for debugging
  console.log('🔍 Prisma Client initialization:')
  console.log('- NODE_ENV:', process.env.NODE_ENV)
  console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL)
  console.log('- DATABASE_URL type:', typeof process.env.DATABASE_URL)
  
  if (process.env.DATABASE_URL) {
    console.log('- DATABASE_URL length:', process.env.DATABASE_URL.length)
    console.log('- DATABASE_URL prefix:', process.env.DATABASE_URL.substring(0, 20))
    console.log('- Is valid PostgreSQL URL:',
      process.env.DATABASE_URL.startsWith('postgresql://') ||
      process.env.DATABASE_URL.startsWith('postgres://'))
  }

  // In build environment without DATABASE_URL, return a mock client
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL not found, using fallback client for build')
    return {} as PrismaClient
  }

  // Validate URL format before creating client
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('❌ Invalid DATABASE_URL format detected:', dbUrl.substring(0, 30))
    console.error('📋 Full environment keys:', Object.keys(process.env).filter(k => k.includes('DATABASE')))
    
    // Return mock client to prevent app crash, but log the error
    return {} as PrismaClient
  }

  try {
    console.log('✅ Creating Prisma Client with valid DATABASE_URL')
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  } catch (error) {
    console.error('❌ Failed to create Prisma Client:', error)
    return {} as PrismaClient
  }
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const db = globalThis.prisma ?? prismaClientSingleton()

export default db

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
