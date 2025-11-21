import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth0 } from '@/lib/auth0';

export async function GET() {
    try {
        const session = await auth0.getSession();

        let auth0User = session?.user;

        // Fallback to manager user for development
        if (!auth0User) {
            auth0User = {
                sub: 'auth0|691f989d2bc713054fec2340',
                email: 'manager@test.com',
                name: 'Tour Manager',
                picture: 'https://github.com/shadcn.png',
                'https://tour-guide.app/roles': ['Manager']
            };
        }

        if (!auth0User) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find user in DB - try auth0Id first, then email
        let user = await db.user.findUnique({
            where: { auth0Id: auth0User.sub }
        });

        if (!user) {
            user = await db.user.findUnique({
                where: { email: auth0User.email || 'manager@test.com' }
            });
            
            // If found by email, update the auth0Id
            if (user) {
                user = await db.user.update({
                    where: { id: user.id },
                    data: { auth0Id: auth0User.sub }
                });
            } else {
                // Only create if truly not found
                try {
                    user = await db.user.create({
                        data: {
                            auth0Id: auth0User.sub,
                            email: auth0User.email || 'manager@test.com',
                            name: auth0User.name || 'Tour Manager',
                            role: 'MANAGER'
                        }
                    });
                } catch (e) {
                    // If unique constraint fails, try finding again
                    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
                        user = await db.user.findFirst({
                            where: {
                                OR: [
                                    { auth0Id: auth0User.sub },
                                    { email: auth0User.email || 'manager@test.com' }
                                ]
                            }
                        });
                    } else {
                        throw e;
                    }
                }
            }
        }

        if (!user) {
            // Optionally create user if they don't exist yet (first login sync)
            // For now, return 401 or 404
            return NextResponse.json({ error: 'User not found in database' }, { status: 401 });
        }

        // First update any tours that should be inactive based on end date
        const currentDate = new Date();
        await db.tour.updateMany({
            where: {
                managerId: user.id,
                endDate: {
                    lt: currentDate
                },
                isActive: true
            },
            data: {
                isActive: false
            }
        });

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
            orderBy: [
                { isActive: 'desc' }, // Active tours first
                { createdAt: 'desc' }  // Then by creation date
            ],
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

        // Fallback to manager user for development
        if (!auth0User) {
            auth0User = {
                sub: 'auth0|691f989d2bc713054fec2340',
                email: 'manager@test.com',
                name: 'Tour Manager',
                picture: 'https://github.com/shadcn.png',
                'https://tour-guide.app/roles': ['Manager']
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
            // For manager user fallback, try to find by email first to avoid conflicts
            if (auth0User.sub === 'auth0|691f989d2bc713054fec2340') {
                user = await db.user.findUnique({
                    where: { email: 'manager@test.com' }
                });
                
                // If found by email, update any auth0Id mismatches
                if (user && user.auth0Id !== auth0User.sub) {
                    user = await db.user.update({
                        where: { id: user.id },
                        data: { auth0Id: auth0User.sub }
                    });
                }
            }
            
            // If still no user found, create a new one
            if (!user) {
                user = await db.user.create({
                    data: {
                        auth0Id: auth0User.sub,
                        email: auth0User.email || 'manager@test.com',
                        name: auth0User.name || 'Tour Manager',
                        role: 'MANAGER'
                    }
                });
            }
        }

        const body = await request.json();
        const { name, startDate, endDate } = body;

        if (!name) {
            return NextResponse.json({ error: 'Tour name is required' }, { status: 400 });
        }

        // Determine if tour should be active based on end date
        const currentDate = new Date();
        const tourEndDate = endDate ? new Date(endDate) : null;
        const shouldBeActive = !tourEndDate || tourEndDate >= currentDate;

        const tour = await db.tour.create({
            data: {
                name,
                startDate: startDate ? new Date(startDate) : null,
                endDate: tourEndDate,
                isActive: shouldBeActive,
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

export async function PUT(request: NextRequest) {
    try {
        const session = await auth0.getSession();

        let auth0User = session?.user as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        // Fallback to demo user for development
        if (!auth0User) {
            auth0User = {
                sub: 'demo-user',
                email: 'demo@example.com',
                name: 'Demo User',
                picture: 'https://github.com/shadcn.png',
                'https://tour-guide.app/roles': ['Manager']
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
            // For demo user, try to find by email first to avoid conflicts
            if (auth0User.sub === 'demo-user') {
                user = await db.user.findUnique({
                    where: { email: 'demo@example.com' }
                });
                
                // If found by email, update the auth0Id to match
                if (user) {
                    user = await db.user.update({
                        where: { id: user.id },
                        data: { auth0Id: 'demo-user' }
                    });
                }
            }
            
            // If still no user found, create a new one
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
        }

        const body = await request.json();
        const { id, name, startDate, endDate } = body;

        if (!id) {
            return NextResponse.json({ error: 'Tour ID is required' }, { status: 400 });
        }

        // Verify tour belongs to user
        const existingTour = await db.tour.findFirst({
            where: {
                id,
                managerId: user.id,
            },
        });

        if (!existingTour) {
            return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
        }

        // Determine if tour should be active based on end date
        const currentDate = new Date();
        const tourEndDate = endDate ? new Date(endDate) : existingTour.endDate;
        const shouldBeActive = !tourEndDate || tourEndDate >= currentDate;

        const updatedTour = await db.tour.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
                isActive: shouldBeActive,
            },
            include: {
                shows: {
                    orderBy: { date: 'asc' },
                },
                _count: {
                    select: { shows: true, merchItems: true },
                },
            },
        });

        return NextResponse.json(updatedTour);
    } catch (error) {
        console.error('Error updating tour:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth0.getSession();

        let auth0User = session?.user as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        // Fallback to demo user for development
        if (!auth0User) {
            auth0User = {
                sub: 'demo-user',
                email: 'demo@example.com',
                name: 'Demo User',
                picture: 'https://github.com/shadcn.png',
                'https://tour-guide.app/roles': ['Manager']
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
            // For demo user, try to find by email first to avoid conflicts
            if (auth0User.sub === 'demo-user') {
                user = await db.user.findUnique({
                    where: { email: 'demo@example.com' }
                });
                
                // If found by email, update the auth0Id to match
                if (user) {
                    user = await db.user.update({
                        where: { id: user.id },
                        data: { auth0Id: 'demo-user' }
                    });
                }
            }
            
            // If still no user found, create a new one
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
        }

        const { searchParams } = new URL(request.url);
        const tourId = searchParams.get('id');

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

        // Delete the tour (shows and merch items will be deleted by cascade)
        await db.tour.delete({
            where: { id: tourId },
        });

        return NextResponse.json({ message: 'Tour deleted successfully' });
    } catch (error) {
        console.error('Error deleting tour:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
