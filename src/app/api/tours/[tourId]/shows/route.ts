import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth0 } from '@/lib/auth0';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) {
    try {
        const session = await auth0.getSession();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { auth0Id: session.user.sub }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 401 });
        }

        const { tourId } = await params;

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
                { error: 'City and date are required' },
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
