import { NextRequest, NextResponse } from 'next/server';
import db, { findOrCreateUser } from '@/lib/db';
import { auth0 } from '@/lib/auth0';
import { apiCache, createCacheKey, DASHBOARD_CACHE_TTL } from '@/lib/cache';

export async function GET(_request: NextRequest) {
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

        // Check cache first
        const cacheKey = createCacheKey('dashboard', user.id);
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
            return NextResponse.json(cachedData);
        }

        // Single optimized query to get all dashboard data
        const dashboardData = await db.tour.findMany({
            where: { managerId: user.id },
            include: {
                shows: {
                    orderBy: { date: 'asc' },
                    include: {
                        inventoryRecords: {
                            include: {
                                variant: {
                                    include: {
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
                    select: { shows: true, merchItems: true }
                }
            },
            orderBy: [
                { isActive: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        // Transform data to include flattened inventory records for easier processing
        const allInventoryRecords = dashboardData.flatMap(tour =>
            tour.shows.flatMap(show =>
                show.inventoryRecords.map(record => ({
                    ...record,
                    show: {
                        id: show.id,
                        name: show.name,
                        date: show.date,
                        venue: show.venue
                    }
                }))
            )
        );

        const response = {
            tours: dashboardData.map(tour => ({
                id: tour.id,
                name: tour.name,
                isActive: tour.isActive,
                startDate: tour.startDate,
                endDate: tour.endDate,
                shows: tour.shows.map(show => ({
                    id: show.id,
                    name: show.name,
                    date: show.date,
                    venue: show.venue,
                    ticketsSold: show.ticketsSold,
                    totalTickets: show.totalTickets
                })),
                _count: tour._count
            })),
            allInventoryRecords
        };

        // Cache the response
        apiCache.set(cacheKey, response, DASHBOARD_CACHE_TTL);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}