import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth0 } from '@/lib/auth0';
import { findOrCreateUser } from '@/lib/db';

/**
 * API route to sync user data from Auth0 to local database
 * Called after successful Auth0 login
 */
export async function GET() {
    try {
        const session = await auth0.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Use the helper function to find or create user
        const user = await findOrCreateUser(session.user);

        // Check for demo mode override
        const cookieStore = await cookies();
        const isDemo = cookieStore.get('demo_mode')?.value === 'true';
        const demoUserType = cookieStore.get('demo_user_type')?.value;

        // Use demo role if in demo mode, otherwise use database role
        const finalRole = (isDemo && demoUserType)
            ? demoUserType.toUpperCase()
            : user.role;

        console.log('🔐 Auth Sync Response:');
        console.log('  User:', user.email);
        console.log('  DB Role:', user.role);
        console.log('  Final Role:', finalRole);
        console.log('  Demo Mode:', isDemo);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: finalRole
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
