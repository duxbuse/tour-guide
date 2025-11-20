import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // TODO: Add proper Auth0 authentication
        // For now, get the first user or create a demo user
        let user = await db.user.findFirst();

        if (!user) {
            // Create a demo user for development
            user = await db.user.create({
                data: {
                    auth0Id: 'demo-user',
                    email: 'demo@example.com',
                    name: 'Demo User',
                    role: 'MANAGER',
                },
            });
        }

        const tours = await db.tour.findMany({
            where: { managerId: user.id },
            include: {
                shows: {
                    orderBy: { date: 'asc' },
                },
                _count: {
                    select: { shows: true, merchItems: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(tours);
    } catch (error) {
        console.error('Error fetching tours:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // TODO: Add proper Auth0 authentication
        // For now, get the first user or create a demo user
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
        const { name, startDate, endDate } = body;

        if (!name) {
            return NextResponse.json({ error: 'Tour name is required' }, { status: 400 });
        }

        const tour = await db.tour.create({
            data: {
                name,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                managerId: user.id,
            },
            include: {
                shows: true,
                _count: {
                    select: { shows: true, merchItems: true },
                },
            },
        });

        return NextResponse.json(tour, { status: 201 });
    } catch (error) {
        console.error('Error creating tour:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
