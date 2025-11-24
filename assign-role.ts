import { db } from './lib/db';

async function assignManagerRole() {
    const email = 'duxbuse@gmail.com'; // Replace with your email

    try {
        // Find user by email
        const user = await db.user.findUnique({
            where: { email }
        });

        if (user) {
            // Update role to MANAGER
            await db.user.update({
                where: { id: user.id },
                data: { role: 'MANAGER' }
            });
            console.log(`✓ Manager role assigned to ${email}`);
        } else {
            console.log(`User with email ${email} not found in database`);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.$disconnect();
    }
}

assignManagerRole();
