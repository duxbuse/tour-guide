import { PrismaClient } from '@prisma/client'

// Create a safely initialized Prisma client that handles environment issues
function createPrismaClient() {
  // Ensure we have a valid DATABASE_URL before creating the client
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.warn('DATABASE_URL not available - creating mock client')
    return null
  }

  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    console.error('Invalid DATABASE_URL format:', databaseUrl.substring(0, 20))
    return null
  }

  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    
    console.log('✅ Prisma client created successfully')
    return client
  } catch (error) {
    console.error('Failed to create Prisma client:', error)
    return null
  }
}

// Safely get a Prisma client instance
export function getPrismaClient(): PrismaClient {
  const client = createPrismaClient()
  
  if (!client) {
    throw new Error('Database not available - check DATABASE_URL environment variable')
  }
  
  return client
}

// For API routes that need database access
export async function withDatabase<T>(
  handler: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    const prisma = getPrismaClient()
    const result = await handler(prisma)
    await prisma.$disconnect()
    return result
  } catch (error) {
    console.error('Database operation failed:', error)
    throw error
  }
}