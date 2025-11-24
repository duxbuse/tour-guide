import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import db from '@/lib/db';

/**
 * API route to sync user data from Auth0 to local database
 * Called after successful Auth0 login
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth0.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const auth0Id = session.user.sub;
        const email = session.user.email;
        const name = session.user.name;

        if (!auth0Id || !email) {
            return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
        }

        // Check if user exists in database
        let user = await db.user.findUnique({
            where: { auth0Id }
        });

        // If user doesn't exist, create them
        if (!user) {
            // Check if this is the first user (should be manager)
            const userCount = await db.user.count();
            const isFirstUser = userCount === 0;

            const defaultRole = isFirstUser ? 'MANAGER' : 'SELLER';

            console.log(`Creating new user with ${defaultRole} role:`, email);
            user = await db.user.create({
                data: {
                    auth0Id,
                    email,
                    name: name || email.split('@')[0],
                    role: defaultRole,
                }
            });
            console.log('User created:', user.id, 'with role:', user.role);
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error syncing user:', error);
        return NextResponse.json({
            error: 'Failed to sync user',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
