import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: { tourId: string } }
) {
    try {
        // TODO: Add proper Auth0 authentication
        let user = await db.user.findFirst();

        if (!user) {
            user = await db.user.create({
                data: {
                    auth0Id: 'demo-user',
                    email: 'demo@example.com',
                    name: 'Demo User',
                    role: 'MANAGER',
                },
            });
        }

        const { tourId } = params;

        // Verify tour belongs to user
        const tour = await db.tour.findFirst({
            where: {
                id: tourId,
                managerId: user.id,
            },
        });

        if (!tour) {
            return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
        }

        const body = await request.json();
        const { name, date, venue } = body;

        if (!name || !date) {
            return NextResponse.json(
                { error: 'Show name and date are required' },
                { status: 400 }
            );
        }

        const show = await db.show.create({
            data: {
                name,
                date: new Date(date),
                venue,
                tourId,
            },
        });

        return NextResponse.json(show, { status: 201 });
    } catch (error) {
        console.error('Error creating show:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
