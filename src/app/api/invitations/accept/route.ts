import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth0 } from '@/lib/auth0';

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Invitation token is required' },
                { status: 400 }
            );
        }

        // Find invitation by token
        const invitation = await db.invitation.findUnique({
            where: { token },
        });

        if (!invitation) {
            return NextResponse.json(
                { error: 'Invalid invitation token' },
                { status: 404 }
            );
        }

        // Check if invitation has expired
        if (new Date() > invitation.expiresAt) {
            await db.invitation.update({
                where: { id: invitation.id },
                data: { status: 'EXPIRED' },
            });
            return NextResponse.json(
                { error: 'Invitation has expired' },
                { status: 400 }
            );
        }

        // Check if invitation is already accepted
        if (invitation.status === 'ACCEPTED') {
            return NextResponse.json(
                { error: 'Invitation has already been accepted' },
                { status: 400 }
            );
        }

        // Get current user session
        const session = await auth0.getSession();
        const auth0User = session?.user;

        if (!auth0User) {
            // User needs to log in/sign up first
            // Redirect to Auth0 login with return URL
            const baseUrl =
                process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const returnUrl = `${baseUrl}/api/invitations/accept?token=${token}`;
            return NextResponse.redirect(
                `${baseUrl}/api/auth/login?returnTo=${encodeURIComponent(returnUrl)}`
            );
        }

        // Check if user email matches invitation email
        if (auth0User.email !== invitation.email) {
            return NextResponse.json(
                {
                    error:
                        'This invitation was sent to a different email address. Please log in with the correct account.',
                },
                { status: 403 }
            );
        }

        // Find or create user
        const user = await db.user.upsert({
            where: { auth0Id: auth0User.sub },
            update: {
                email: auth0User.email!,
                name: auth0User.name,
                role: invitation.role,
            },
            create: {
                auth0Id: auth0User.sub!,
                email: auth0User.email!,
                name: auth0User.name,
                role: invitation.role,
            },
        });

        // Mark invitation as accepted
        await db.invitation.update({
            where: { id: invitation.id },
            data: { status: 'ACCEPTED' },
        });

        // Redirect to dashboard
        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        return NextResponse.redirect(`${baseUrl}/dashboard`);
    } catch (error) {
        console.error('Error accepting invitation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
