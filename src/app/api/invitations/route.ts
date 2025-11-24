import { NextRequest, NextResponse } from 'next/server';
import db, { findOrCreateUser } from '@/lib/db';
import { auth0 } from '@/lib/auth0';
import { generateInvitationToken } from '@/lib/seller-access';
import { getAuthenticatedUser, isManager } from '@/lib/rbac';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is a manager
        if (!isManager(user)) {
            return NextResponse.json(
                { error: 'Access denied. Manager role required.' },
                { status: 403 }
            );
        }

        // Get all invitations created by this manager
        const invitations = await db.invitation.findMany({
            where: {
                managerId: user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(invitations);
    } catch (error) {
        console.error('Error fetching invitations:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is a manager
        if (!isManager(user)) {
            return NextResponse.json(
                { error: 'Access denied. Manager role required.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { email, role = 'SELLER' } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Generate invitation token
        const token = generateInvitationToken();

        // Set expiration to 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Create invitation
        const invitation = await db.invitation.create({
            data: {
                email,
                role,
                token,
                managerId: user.id,
                expiresAt,
                status: 'PENDING',
            },
        });

        // In a real app, you would send an email here
        // For demo purposes, we'll return the invitation link
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const invitationLink = `${baseUrl}/api/invitations/accept?token=${token}`;

        return NextResponse.json(
            {
                ...invitation,
                invitationLink, // Include link for demo purposes
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating invitation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is a manager
        if (!isManager(user)) {
            return NextResponse.json(
                { error: 'Access denied. Manager role required.' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const invitationId = searchParams.get('id');

        if (!invitationId) {
            return NextResponse.json(
                { error: 'Invitation ID is required' },
                { status: 400 }
            );
        }

        // Verify invitation belongs to this manager
        const invitation = await db.invitation.findFirst({
            where: {
                id: invitationId,
                managerId: user.id,
            },
        });

        if (!invitation) {
            return NextResponse.json(
                { error: 'Invitation not found' },
                { status: 404 }
            );
        }

        // Mark as expired instead of deleting
        await db.invitation.update({
            where: { id: invitationId },
            data: { status: 'EXPIRED' },
        });

        return NextResponse.json({ message: 'Invitation cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling invitation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
