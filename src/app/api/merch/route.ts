import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const tourId = searchParams.get('tourId');

        if (!tourId) {
            return NextResponse.json({ error: 'Tour ID is required' }, { status: 400 });
        }

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

        const merchItems = await db.merchItem.findMany({
            where: { tourId },
            include: {
                variants: {
                    orderBy: { size: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(merchItems);
    } catch (error) {
        console.error('Error fetching merch items:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { tourId, name, description, imageUrl, variants } = body;

        if (!tourId || !name || !variants || variants.length === 0) {
            return NextResponse.json(
                { error: 'Tour ID, name, and at least one variant are required' },
                { status: 400 }
            );
        }

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

        const merchItem = await db.merchItem.create({
            data: {
                name,
                description,
                imageUrl,
                tourId,
                variants: {
                    create: variants.map((v: any) => ({
                        size: v.size,
                        type: v.type,
                        price: parseFloat(v.price),
                    })),
                },
            },
            include: {
                variants: true,
            },
        });

        return NextResponse.json(merchItem, { status: 201 });
    } catch (error) {
        console.error('Error creating merch item:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
