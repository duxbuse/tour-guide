import { PrismaClient, User } from '@prisma/client'
import { getCachedUser, setCachedUser } from './cache'

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
    console.log('✅ Creating Prisma Client with optimized configuration')
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      // Connection pool optimization
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      // Enable query optimization features
      // Note: These would be configured in schema.prisma for connection pooling
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

// Helper function to find or create user (eliminates repetitive code)
export async function findOrCreateUser(auth0User: {
  sub: string;
  email?: string;
  name?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}): Promise<User> {
  if (!auth0User) {
    throw new Error('No auth0 user provided')
  }

  // Check cache first
  const cachedUser = getCachedUser(auth0User.sub) as User | null
  if (cachedUser) {
    return cachedUser
  }

  // Try to find by auth0Id first
  let user = await db.user.findUnique({
    where: { auth0Id: auth0User.sub }
  })

  if (!user) {
    // Try to find by email as fallback
    user = await db.user.findUnique({
      where: { email: auth0User.email }
    })
    
    // If found by email, update the auth0Id
    if (user) {
      user = await db.user.update({
        where: { id: user.id },
        data: { auth0Id: auth0User.sub }
      })
    } else {
      // Create new user if not found
      try {
        user = await db.user.create({
          data: {
            auth0Id: auth0User.sub,
            email: auth0User.email || 'manager@test.com',
            name: auth0User.name || 'Tour Manager',
            role: 'MANAGER'
          }
        })
      } catch (e) {
        // Handle unique constraint errors
        if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
          user = await db.user.findFirst({
            where: {
              OR: [
                { auth0Id: auth0User.sub },
                { email: auth0User.email }
              ]
            }
          })
        } else {
          throw e
        }
      }
    }
  }

  if (!user) {
    throw new Error('Failed to find or create user')
  }

  // Cache the user for future requests
  setCachedUser(auth0User.sub, user)

  return user
}
