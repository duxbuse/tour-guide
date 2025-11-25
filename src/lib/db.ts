import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

console.log('🔍 Prisma Client initialization:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('- DATABASE_URL type:', typeof process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
    const urlLength = process.env.DATABASE_URL.length;
    const urlPrefix = process.env.DATABASE_URL.substring(0, 20);
    const isValidPostgres = process.env.DATABASE_URL.startsWith('postgresql://');

    console.log('- DATABASE_URL length:', urlLength);
    console.log('- DATABASE_URL prefix:', urlPrefix);
    console.log('- Is valid PostgreSQL URL:', isValidPostgres);
}

export const prisma = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

console.log('✅ Creating Prisma Client with optimized configuration');

// Helper function to find or create user
export async function findOrCreateUser(auth0User: {
    sub: string;
    email?: string;
    name?: string;
    [key: string]: unknown;
}) {
    const auth0Id = auth0User.sub;
    const email = auth0User.email;
    const name = auth0User.name;

    if (!auth0Id || !email) {
        throw new Error('Invalid user data: missing auth0Id or email');
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
        where: { auth0Id }
    });

    // If user doesn't exist, create them
    if (!user) {
        // Check if there are any non-test users
        const allUsers = await prisma.user.findMany();
        const nonTestUsers = allUsers.filter(u =>
            !u.email.includes('@test.com')
        );

        // Assign MANAGER role if:
        // 1. This is the very first user, OR
        // 2. There are only test users (from seed data)
        const shouldBeManager = allUsers.length === 0 || nonTestUsers.length === 0;
        const defaultRole = shouldBeManager ? 'MANAGER' : 'SELLER';

        console.log(`Creating new user: ${email}`);
        console.log(`Total users: ${allUsers.length}, Non-test users: ${nonTestUsers.length}`);
        console.log(`Assigning role: ${defaultRole}`);

        user = await prisma.user.create({
            data: {
                auth0Id,
                email,
                name: name || email.split('@')[0],
                role: defaultRole,
            }
        });
        console.log('✅ User created:', user.id, 'with role:', user.role);
    }

    return user;
}

export default prisma;
