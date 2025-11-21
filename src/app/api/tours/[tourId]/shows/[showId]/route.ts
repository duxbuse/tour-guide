import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth0 } from '@/lib/auth0';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string; showId: string }> }
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

        const { tourId, showId } = await params;

        // Verify tour and show belong to user
        const tour = await db.tour.findFirst({
            where: {
                id: tourId,
                managerId: user.id,
            },
        });

        if (!tour) {
            return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
        }

        const existingShow = await db.show.findFirst({
            where: {
                id: showId,
                tourId,
            },
        });

        if (!existingShow) {
            return NextResponse.json({ error: 'Show not found' }, { status: 404 });
        }

        const body = await request.json();
        const { name, date, venue } = body;

        if (!name || !date) {
            return NextResponse.json(
                { error: 'City and date are required' },
                { status: 400 }
            );
        }

        // Validate show date is within tour date range
        const showDate = new Date(date);
        if (tour.startDate && showDate < tour.startDate) {
            return NextResponse.json(
                { 
                    error: `Show date must be after the tour start date (${tour.startDate.toISOString().split('T')[0]})` 
                },
                { status: 400 }
            );
        }
        if (tour.endDate && showDate > tour.endDate) {
            return NextResponse.json(
                { 
                    error: `Show date must be before the tour end date (${tour.endDate.toISOString().split('T')[0]})` 
                },
                { status: 400 }
            );
        }

        const updatedShow = await db.show.update({
            where: { id: showId },
            data: {
                name,
                date: new Date(date),
                venue,
            },
        });

        return NextResponse.json(updatedShow);
    } catch (error) {
        console.error('Error updating show:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string; showId: string }> }
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

        const { tourId, showId } = await params;

        // Verify tour and show belong to user
        const tour = await db.tour.findFirst({
            where: {
                id: tourId,
                managerId: user.id,
            },
        });

        if (!tour) {
            return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
        }

        const existingShow = await db.show.findFirst({
            where: {
                id: showId,
                tourId,
            },
        });

        if (!existingShow) {
            return NextResponse.json({ error: 'Show not found' }, { status: 404 });
        }

        // Delete the show (this will cascade delete inventory records)
        await db.show.delete({
            where: { id: showId },
        });

        return NextResponse.json({ message: 'Show deleted successfully' });
    } catch (error) {
        console.error('Error deleting show:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}