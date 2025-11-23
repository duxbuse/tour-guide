import { NextRequest, NextResponse } from 'next/server';
import db, { findOrCreateUser } from '@/lib/db';
import { auth0 } from '@/lib/auth0';

export async function GET(request: NextRequest) {
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
            };
        }

        if (!auth0User) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await findOrCreateUser(auth0User);

        // Check user role
        const userRoles = (
            (auth0User['https://tour-guide.app/roles'] as string[]) || []
        ).map((r) => r.toLowerCase());
        const isManager = userRoles.includes('manager');
        const isSeller = userRoles.includes('seller');

        if (!isManager && !isSeller) {
            return NextResponse.json(
                { error: 'Access denied. Manager or Seller role required.' },
                { status: 403 }
            );
        }

        let assignments;

        if (isManager) {
            // Managers can see all assignments for their tours
            assignments = await db.sellerAssignment.findMany({
                where: {
                    show: {
                        tour: {
                            managerId: user.id,
                        },
                    },
                },
                include: {
                    seller: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                        },
                    },
                    show: {
                        include: {
                            tour: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        } else {
            // Sellers can only see their own assignments
            assignments = await db.sellerAssignment.findMany({
                where: {
                    sellerId: user.id,
                },
                include: {
                    seller: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                        },
                    },
                    show: {
                        include: {
                            tour: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }

        return NextResponse.json(assignments);
    } catch (error) {
        console.error('Error fetching seller assignments:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
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
            };
        }

        if (!auth0User) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await findOrCreateUser(auth0User);

        // Check if user is a manager
        const userRoles = (
            (auth0User['https://tour-guide.app/roles'] as string[]) || []
        ).map((r) => r.toLowerCase());
        const isManager = userRoles.includes('manager');

        if (!isManager) {
            return NextResponse.json(
                { error: 'Access denied. Manager role required.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { sellerId, showId } = body;

        if (!sellerId || !showId) {
            return NextResponse.json(
                { error: 'Seller ID and Show ID are required' },
                { status: 400 }
            );
        }

        // Verify seller exists and has seller role
        const seller = await db.user.findUnique({
            where: { id: sellerId },
        });

        if (!seller) {
            return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
        }

        if (seller.role !== 'SELLER') {
            return NextResponse.json(
                { error: 'User is not a seller' },
                { status: 400 }
            );
        }

        // Verify show exists and belongs to manager's tour
        const show = await db.show.findFirst({
            where: {
                id: showId,
                tour: {
                    managerId: user.id,
                },
            },
            include: {
                tour: true,
            },
        });

        if (!show) {
            return NextResponse.json(
                { error: 'Show not found or does not belong to your tour' },
                { status: 404 }
            );
        }

        // Check if assignment already exists
        const existingAssignment = await db.sellerAssignment.findUnique({
            where: {
                sellerId_showId: {
                    sellerId,
                    showId,
                },
            },
        });

        if (existingAssignment) {
            return NextResponse.json(
                { error: 'Seller is already assigned to this show' },
                { status: 400 }
            );
        }

        // Create assignment
        const assignment = await db.sellerAssignment.create({
            data: {
                sellerId,
                showId,
            },
            include: {
                seller: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                    },
                },
                show: {
                    include: {
                        tour: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(assignment, { status: 201 });
    } catch (error) {
        console.error('Error creating seller assignment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
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
            };
        }

        if (!auth0User) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await findOrCreateUser(auth0User);

        // Check if user is a manager
        const userRoles = (
            (auth0User['https://tour-guide.app/roles'] as string[]) || []
        ).map((r) => r.toLowerCase());
        const isManager = userRoles.includes('manager');

        if (!isManager) {
            return NextResponse.json(
                { error: 'Access denied. Manager role required.' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const assignmentId = searchParams.get('id');

        if (!assignmentId) {
            return NextResponse.json(
                { error: 'Assignment ID is required' },
                { status: 400 }
            );
        }

        // Verify assignment exists and belongs to manager's tour
        const assignment = await db.sellerAssignment.findFirst({
            where: {
                id: assignmentId,
                show: {
                    tour: {
                        managerId: user.id,
                    },
                },
            },
        });

        if (!assignment) {
            return NextResponse.json(
                { error: 'Assignment not found' },
                { status: 404 }
            );
        }

        // Delete assignment
        await db.sellerAssignment.delete({
            where: { id: assignmentId },
        });

        return NextResponse.json({
            message: 'Seller assignment removed successfully',
        });
    } catch (error) {
        console.error('Error removing seller assignment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
