import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            email: true,
            role: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });

    console.log('Current users:');
    users.forEach(u => {
        console.log(`- ${u.email}: ${u.role} (created: ${u.createdAt})`);
    });

    await prisma.$disconnect();
}

main().catch(console.error);
