import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { findOrCreateUser } from '@/lib/db';
import { auth0 } from '@/lib/auth0';
import { apiCache, createCacheKey, TOURS_CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
    const startTime = Date.now();
    console.log('🚀 Tours API: Starting request');

    try {
        const authStart = Date.now();
        const session = await auth0.getSession();
        console.log(`⏱️ Tours API: Auth took ${Date.now() - authStart}ms`);

        const auth0User = session?.user;



        if (!auth0User) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use optimized user lookup
        const userStart = Date.now();
        const user = await findOrCreateUser(auth0User);
        console.log(`⏱️ Tours API: User lookup took ${Date.now() - userStart}ms`);

        // Check user role
        const userRoles = ((auth0User['https://tour-guide.app/roles'] as string[]) || []).map(r => r.toLowerCase());
        let isManager = userRoles.includes('manager');
        let isSeller = userRoles.includes('seller');

        // Check for demo mode override
        const cookieStore = await cookies();
        const isDemo = cookieStore.get('demo_mode')?.value === 'true';
        const demoUserType = cookieStore.get('demo_user_type')?.value;

        if (isDemo && demoUserType) {
            isManager = demoUserType === 'manager';
            isSeller = demoUserType === 'seller';
        }

        // Check if client wants detailed data or just summary
        const { searchParams } = new URL(request.url);
        const includeShows = searchParams.get('includeShows') === 'true';
        const includeInventory = searchParams.get('includeInventory') === 'true';

        // Create cache key based on requested data and role
        const cacheKey = createCacheKey('tours', user.id, includeShows.toString(), includeInventory.toString(), isSeller ? 'seller' : 'manager');

        // Check cache first
        const cacheStart = Date.now();
        const cachedResult = apiCache.get(cacheKey);
        console.log(`⏱️ Tours API: Cache check took ${Date.now() - cacheStart}ms`);
        if (cachedResult) {
            console.log(`🎯 Tours API: Cache hit! Total time: ${Date.now() - startTime}ms`);
            return NextResponse.json(cachedResult);
        }

        // Skip the updateMany operation entirely for read requests - handle this in a background job or separate endpoint
        // This was causing significant delay

        // For sellers, get their assigned show IDs first
        let assignedShowIds: string[] = [];
        if (isSeller) {
            const assignments = await db.sellerAssignment.findMany({
                where: { sellerId: user.id },
                select: { showId: true },
            });
            assignedShowIds = assignments.map(a => a.showId);
        }

        // Super fast basic query - just tours with counts (default case)
        if (!includeShows && !includeInventory) {
            // Most minimal query possible for fast loading
            let tours;

            if (isManager) {
                tours = await db.tour.findMany({
                    where: { managerId: user.id },
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,
                        _count: {
                            select: { shows: true, merchItems: true },
                        },
                    },
                    orderBy: [
                        { isActive: 'desc' },
                        { updatedAt: 'desc' }
                    ],
                });
            } else {
                // Sellers only see tours that have shows they're assigned to
                tours = await db.tour.findMany({
                    where: {
                        shows: {
                            some: {
                                id: {
                                    in: assignedShowIds,
                                },
                            },
                        },
                    },
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,
                        _count: {
                            select: { shows: true, merchItems: true },
                        },
                    },
                    orderBy: [
                        { isActive: 'desc' },
                        { updatedAt: 'desc' }
                    ],
                });
            }

            // Cache the result for future requests
            apiCache.set(cacheKey, tours, TOURS_CACHE_TTL);
            return NextResponse.json(tours);
        }

        // Optimized shows query - limit to essential fields only
        if (includeShows && !includeInventory) {
            const queryStart = Date.now();
            let tours;

            if (isManager) {
                tours = await db.tour.findMany({
                    where: { managerId: user.id },
                    include: {
                        shows: {
                            orderBy: { date: 'asc' },
                            select: {
                                id: true,
                                name: true,
                                date: true,
                                venue: true,
                                ticketsSold: true,
                                totalTickets: true,
                                sellerAssignments: {
                                    include: {
                                        seller: {
                                            select: {
                                                id: true,
                                                email: true,
                                                name: true,
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        _count: {
                            select: { shows: true, merchItems: true },
                        },
                    },
                    orderBy: [
                        { isActive: 'desc' },
                        { updatedAt: 'desc' }
                    ],
                });
            } else {
                // Sellers see tours with assigned shows, and only their assigned shows
                const toursWithAllShows = await db.tour.findMany({
                    where: {
                        shows: {
                            some: {
                                id: {
                                    in: assignedShowIds,
                                },
                            },
                        },
                    },
                    include: {
                        shows: {
                            where: {
                                id: {
                                    in: assignedShowIds,
                                },
                            },
                            orderBy: { date: 'asc' },
                            select: {
                                id: true,
                                name: true,
                                date: true,
                                venue: true,
                                ticketsSold: true,
                                totalTickets: true
                            }
                        },
                        _count: {
                            select: { shows: true, merchItems: true },
                        },
                    },
                    orderBy: [
                        { isActive: 'desc' },
                        { updatedAt: 'desc' }
                    ],
                });
                tours = toursWithAllShows;
            }

            console.log(`⏱️ Tours API: Shows query took ${Date.now() - queryStart}ms`);

            // Cache the result for future requests
            apiCache.set(cacheKey, tours, TOURS_CACHE_TTL);
            console.log(`✅ Tours API: With shows total time ${Date.now() - startTime}ms`);
            return NextResponse.json(tours);
        }

        // Full query with inventory (only when specifically requested)
        const queryStart = Date.now();
        const tours = await db.tour.findMany({
            where: { managerId: user.id },
            include: {
                shows: {
                    orderBy: { date: 'asc' },
                    select: {
                        id: true,
                        name: true,
                        date: true,
                        venue: true,
                        ticketsSold: true,
                        totalTickets: true,
                        inventoryRecords: {
                            include: {
                                variant: {
                                    select: {
                                        id: true,
                                        size: true,
                                        type: true,
                                        price: true,
                                        quantity: true,
                                        merchItem: {
                                            select: {
                                                id: true,
                                                name: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: { shows: true, merchItems: true },
                },
            },
            orderBy: [
                { isActive: 'desc' },
                { updatedAt: 'desc' }
            ],
        });
        console.log(`⏱️ Tours API: Full inventory query took ${Date.now() - queryStart}ms`);

        // Cache the result for future requests
        apiCache.set(cacheKey, tours, TOURS_CACHE_TTL);
        console.log(`✅ Tours API: Full query total time ${Date.now() - startTime}ms`);

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
                'https://tour-guide.app/roles': ['Manager'],
                roles: ['Manager']
            };
        }

        if (!auth0User) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use optimized user lookup
        const user = await findOrCreateUser(auth0User);

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

        // Invalidate relevant caches
        const baseKeys = ['tours', 'dashboard'];
        baseKeys.forEach(prefix => {
            const keys = apiCache.getStats().keys.filter(key => key.startsWith(`${prefix}:${user.id}`));
            keys.forEach(key => apiCache.delete(key));
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
                sub: 'auth0|691f989d2bc713054fec2340',
                email: 'manager@test.com',
                name: 'Tour Manager',
                picture: 'https://github.com/shadcn.png',
                'https://tour-guide.app/roles': ['Manager'],
                roles: ['Manager']
            };
        }

        if (!auth0User) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use optimized user lookup
        const user = await findOrCreateUser(auth0User);

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

        // Invalidate relevant caches
        const baseKeys = ['tours', 'dashboard'];
        baseKeys.forEach(prefix => {
            const keys = apiCache.getStats().keys.filter(key => key.startsWith(`${prefix}:${user.id}`));
            keys.forEach(key => apiCache.delete(key));
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
                sub: 'auth0|691f989d2bc713054fec2340',
                email: 'manager@test.com',
                name: 'Tour Manager',
                picture: 'https://github.com/shadcn.png',
                'https://tour-guide.app/roles': ['Manager'],
                roles: ['Manager']
            };
        }

        if (!auth0User) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use optimized user lookup
        const user = await findOrCreateUser(auth0User);

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

        // Invalidate relevant caches
        const baseKeys = ['tours', 'dashboard'];
        baseKeys.forEach(prefix => {
            const keys = apiCache.getStats().keys.filter(key => key.startsWith(`${prefix}:${user.id}`));
            keys.forEach(key => apiCache.delete(key));
        });

        return NextResponse.json({ message: 'Tour deleted successfully' });
    } catch (error) {
        console.error('Error deleting tour:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
