import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing demo user...');

  try {
    // Check current users
    const users = await prisma.user.findMany();
    console.log('Current users:', users.map(u => ({ id: u.id, auth0Id: u.auth0Id, email: u.email })));

    // Find demo user by email
    const demoUserByEmail = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    });

    if (demoUserByEmail) {
      console.log('Found demo user by email:', demoUserByEmail);
      
      // Update auth0Id to match what the API expects
      const updatedUser = await prisma.user.update({
        where: { id: demoUserByEmail.id },
        data: { auth0Id: 'demo-user' }
      });
      
      console.log('✅ Updated demo user auth0Id:', updatedUser);
    } else {
      console.log('❌ No demo user found by email');
      
      // Create the demo user
      const newDemoUser = await prisma.user.create({
        data: {
          auth0Id: 'demo-user',
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'MANAGER'
        }
      });
      
      console.log('✅ Created demo user:', newDemoUser);
    }

    // Verify the lookup works
    const testLookup = await prisma.user.findUnique({
      where: { auth0Id: 'demo-user' }
    });
    
    console.log('✅ Verification - demo user lookup by auth0Id:', testLookup ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();