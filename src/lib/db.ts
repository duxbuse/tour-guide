import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

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

        user = await prisma.user.create({
            data: {
                auth0Id,
                email,
                name: name || email.split('@')[0],
                role: defaultRole,
            }
        });

        console.log(`✅ Created user: ${email} with ${defaultRole} role`);
    }

    return user;
}

export default prisma;
