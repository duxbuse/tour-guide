import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth0.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        return NextResponse.json(session.user);
    } catch (error) {
        console.error('Error getting user profile:', error);
        return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
    }
}
