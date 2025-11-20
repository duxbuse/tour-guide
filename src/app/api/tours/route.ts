import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth0 } from '@/lib/auth0';

export async function GET(request: NextRequest) {
    try {
        const session = await auth0.getSession();

        let auth0User = session?.user;

        // Fallback to demo user for development
        if (!auth0User) {
            auth0User = {
                sub: 'demo-user',
                email: 'demo@example.com',
                name: 'Demo User'
            };
        }

        if (!auth0User) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find or create user in DB
        let user = await db.user.findUnique({
            where: { auth0Id: auth0User.sub }
        });

        if (!user) {
            user = await db.user.create({
                data: {
                    auth0Id: auth0User.sub,
                    email: auth0User.email || 'demo@example.com',
                    name: auth0User.name || 'Demo User',
                    role: 'MANAGER'
                }
            });
        }

        if (!user) {
            // Optionally create user if they don't exist yet (first login sync)
            // For now, return 401 or 404
            return NextResponse.json({ error: 'User not found in database' }, { status: 401 });
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
        const session = await auth0.getSession();

        let auth0User = session?.user;

        // Fallback to demo user for development
        if (!auth0User) {
            auth0User = {
                sub: 'demo-user',
                email: 'demo@example.com',
                name: 'Demo User'
            };
        }

        if (!auth0User) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find or create user in DB
        let user = await db.user.findUnique({
            where: { auth0Id: auth0User.sub }
        });

        if (!user) {
            user = await db.user.create({
                data: {
                    auth0Id: auth0User.sub,
                    email: auth0User.email || 'demo@example.com',
                    name: auth0User.name || 'Demo User',
                    role: 'MANAGER'
                }
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
