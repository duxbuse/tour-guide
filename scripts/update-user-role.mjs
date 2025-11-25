import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('📋 Checking all users in database...\n');

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            auth0Id: true
        }
    });

    console.log(`Found ${users.length} users:\n`);
    users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Auth0 ID: ${user.auth0Id}`);
        console.log('');
    });

    // Find Sean Duxbury's user (or any user with duxbusse@gmail.com)
    const seanUser = users.find(u => u.email?.includes('duxbusse'));

    if (seanUser) {
        console.log(`🔧 Found Sean's account: ${seanUser.email}`);
        console.log(`   Current role: ${seanUser.role}`);

        if (seanUser.role !== 'MANAGER') {
            console.log(`   Updating role to MANAGER...`);
            await prisma.user.update({
                where: { id: seanUser.id },
                data: { role: 'MANAGER' }
            });
            console.log(`   ✅ Role updated to MANAGER!`);
        } else {
            console.log(`   ✅ Already has MANAGER role`);
        }
    } else {
        console.log(`⚠️  Sean's account not found. They may need to sign in first to create their account.`);
    }

    await prisma.$disconnect();
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    });
