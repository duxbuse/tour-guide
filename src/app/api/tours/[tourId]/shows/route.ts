import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth0 } from '@/lib/auth0';

export async function GET(
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

        const shows = await db.show.findMany({
            where: { tourId },
            orderBy: { date: 'asc' },
            select: {
                id: true,
                name: true,
                date: true,
                venue: true,
                ticketsSold: true,
                totalTickets: true
            }
        });

        return NextResponse.json(shows);
    } catch (error) {
        console.error('Error fetching shows:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

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

export async function PUT(
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
        const url = new URL(request.url);
        const showId = url.pathname.split('/').pop(); // Get showId from URL path

        if (!showId) {
            return NextResponse.json({ error: 'Show ID is required' }, { status: 400 });
        }

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
                tourId,
            },
        });

        return NextResponse.json(updatedShow);
    } catch (error) {
        console.error('Error updating show:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
