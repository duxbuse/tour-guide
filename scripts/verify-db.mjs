import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
    try {
        console.log('🔍 Verifying Neon database content...');
        
        const userCount = await prisma.user.count();
        const tourCount = await prisma.tour.count();
        const showCount = await prisma.show.count();
        const merchItemCount = await prisma.merchItem.count();
        const variantCount = await prisma.merchVariant.count();
        const inventoryCount = await prisma.inventoryRecord.count();
        
        console.log('📊 Database Content Summary:');
        console.log(`👤 Users: ${userCount}`);
        console.log(`🎵 Tours: ${tourCount}`);
        console.log(`🎪 Shows: ${showCount}`);
        console.log(`👕 Merchandise Items: ${merchItemCount}`);
        console.log(`📐 Variants: ${variantCount}`);
        console.log(`📊 Inventory Records: ${inventoryCount}`);
        
        if (userCount === 0) {
            console.log('❌ No data found in database!');
        } else {
            console.log('✅ Database contains test data!');
            
            // Show sample data
            const users = await prisma.user.findMany({
                select: { email: true, role: true, name: true }
            });
            console.log('\n👥 Users in database:');
            users.forEach(user => {
                console.log(`   • ${user.name} (${user.email}) - Role: ${user.role}`);
            });
            
            const tours = await prisma.tour.findMany({
                select: { name: true, isActive: true, _count: { select: { shows: true } } }
            });
            console.log('\n🎵 Tours in database:');
            tours.forEach(tour => {
                console.log(`   • ${tour.name} - ${tour.isActive ? 'ACTIVE' : 'COMPLETED'} (${tour._count.shows} shows)`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error verifying database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyData();