import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth0 } from '@/lib/auth0';

// Helper function to check user roles
function getUserRoles(user: any): string[] { // eslint-disable-line @typescript-eslint/no-explicit-any
    const customRoles = (user['https://tour-guide.app/roles'] as string[]) || [];
    const standardRoles = (user.roles as string[]) || [];
    return [...customRoles, ...standardRoles].map(r => r.toLowerCase());
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth0.getSession();

        let auth0User = session?.user as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        // Fallback to demo user for development
        if (!auth0User) {
            auth0User = {
                sub: 'demo-user',
                email: 'demo@example.com',
                name: 'Demo User',
                'https://tour-guide.app/roles': ['Manager']
            };
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

        const { searchParams } = new URL(request.url);
        const showId = searchParams.get('showId');
        const tourId = searchParams.get('tourId');

        if (!showId && !tourId) {
            return NextResponse.json({ error: 'Show ID or Tour ID is required' }, { status: 400 });
        }

        let whereClause: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

        if (showId) {
            // Get records for specific show
            whereClause = {
                showId,
                show: {
                    tour: {
                        managerId: user.id
                    }
                }
            };
        } else if (tourId) {
            // Get records for all shows in a tour
            whereClause = {
                show: {
                    tourId,
                    tour: {
                        managerId: user.id
                    }
                }
            };
        }

        // Auto-fix existing records that have missing soldCount
        await recalculateExistingSoldCounts();

        const records = await db.inventoryRecord.findMany({
            where: whereClause,
            include: {
                show: true,
                variant: {
                    include: {
                        merchItem: true,
                    },
                },
            },
            orderBy: [
                { show: { date: 'asc' } },
                { variant: { merchItem: { name: 'asc' } } },
                { variant: { type: 'asc' } },
            ],
        });

        return NextResponse.json(records);
    } catch (error) {
        console.error('Error fetching inventory records:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper function to recalculate soldCount for existing records
async function recalculateExistingSoldCounts() {
    // Find records that have both startCount and endCount but missing soldCount
    const recordsToFix = await db.inventoryRecord.findMany({
        where: {
            AND: [
                { endCount: { not: null } },
                { soldCount: null }
            ]
        }
    });

    // Update each record with calculated soldCount
    for (const record of recordsToFix) {
        if (record.startCount !== null && record.endCount !== null) {
            await db.inventoryRecord.update({
                where: { id: record.id },
                data: { soldCount: record.startCount - record.endCount }
            });
        }
    }
    
    return recordsToFix.length;
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth0.getSession();

        let auth0User = session?.user as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        // Fallback to demo user for development
        if (!auth0User) {
            auth0User = {
                sub: 'demo-user',
                email: 'demo@example.com',
                name: 'Demo User',
                'https://tour-guide.app/roles': ['Manager']
            };
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

        // Check if user has permission (manager or seller)
        const userRoles = getUserRoles(auth0User);
        const isManager = userRoles.includes('manager');
        const isSeller = userRoles.includes('seller');

        if (!isManager && !isSeller) {
            return NextResponse.json({ error: 'Access denied. Manager or Seller role required.' }, { status: 403 });
        }

        const body = await request.json();
        const { showId, variantId, startCount, endCount } = body;

        if (!showId || !variantId) {
            return NextResponse.json({ error: 'Show ID and Variant ID are required' }, { status: 400 });
        }

        // Verify show belongs to user's tour
        const show = await db.show.findFirst({
            where: {
                id: showId,
                tour: {
                    managerId: user.id,
                },
            },
        });

        if (!show) {
            return NextResponse.json({ error: 'Show not found' }, { status: 404 });
        }

        // Calculate sold count: start - end (what was sold)
        const soldCount = (endCount !== undefined && startCount !== undefined)
            ? startCount - endCount
            : undefined;

        // Get existing record to use for calculation if needed
        const existingRecord = await db.inventoryRecord.findUnique({
            where: {
                showId_variantId: {
                    showId,
                    variantId
                }
            }
        });

        // Calculate sold count using either current request values or existing values
        let finalSoldCount = soldCount;
        
        if (finalSoldCount === undefined) {
            const finalStartCount = startCount !== undefined ? startCount : existingRecord?.startCount;
            const finalEndCount = endCount !== undefined ? endCount : existingRecord?.endCount;
            
            if (finalStartCount !== undefined && finalStartCount !== null &&
                finalEndCount !== undefined && finalEndCount !== null) {
                finalSoldCount = finalStartCount - finalEndCount;
            }
        }

        // Upsert inventory record
        const record = await db.inventoryRecord.upsert({
            where: {
                showId_variantId: {
                    showId,
                    variantId
                }
            },
            update: {
                ...(startCount !== undefined && { startCount }),
                addedCount: 0, // Always set to 0 since we're not using this field
                ...(endCount !== undefined && { endCount }),
                ...(finalSoldCount !== undefined && { soldCount: finalSoldCount }),
            },
            create: {
                showId,
                variantId,
                startCount: startCount || 0,
                addedCount: 0, // Always 0 since we're not using this field
                endCount: endCount,
                soldCount: finalSoldCount,
            },
            include: {
                show: true,
                variant: {
                    include: {
                        merchItem: true,
                    },
                },
            },
        });

        return NextResponse.json(record, { status: 201 });
    } catch (error) {
        console.error('Error creating/updating inventory record:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}