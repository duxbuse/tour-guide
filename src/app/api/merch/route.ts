import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth0 } from '@/lib/auth0';

export async function GET(request: NextRequest) {
    try {
        const session = await auth0.getSession();

        let auth0User = session?.user as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        // Fallback to demo user for development
        if (!auth0User) {
            auth0User = {
                sub: 'demo-user',
                email: 'demo@example.com',
                name: 'Demo User'
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
                variants: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Sort variants with proper size ordering
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        
        merchItems.forEach(item => {
            item.variants.sort((a, b) => {
                // First sort by type
                const typeA = a.type || '';
                const typeB = b.type || '';
                if (typeA !== typeB) {
                    return typeA.localeCompare(typeB);
                }
                
                // Then sort by size using proper order
                const sizeIndexA = sizeOrder.indexOf(a.size.toUpperCase());
                const sizeIndexB = sizeOrder.indexOf(b.size.toUpperCase());
                
                // If size found in order array, use that position
                if (sizeIndexA !== -1 && sizeIndexB !== -1) {
                    return sizeIndexA - sizeIndexB;
                }
                
                // If one or both sizes not in array, fall back to alphabetical
                return a.size.localeCompare(b.size);
            });
        });

        return NextResponse.json(merchItems);
    } catch (error) {
        console.error('Error fetching merch items:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper function to check user roles
function getUserRoles(user: any): string[] { // eslint-disable-line @typescript-eslint/no-explicit-any
    const customRoles = (user['https://tour-guide.app/roles'] as string[]) || [];
    const standardRoles = (user.roles as string[]) || [];
    return [...customRoles, ...standardRoles].map(r => r.toLowerCase());
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
                name: 'Demo User'
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

        // Check if user has manager role for creating items
        const userRoles = getUserRoles(auth0User);
        const isManager = userRoles.includes('manager');

        if (!isManager) {
            return NextResponse.json({ error: 'Access denied. Manager role required to create items.' }, { status: 403 });
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
                    create: variants.map((v: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                        size: v.size,
                        type: v.type,
                        price: parseFloat(v.price),
                        quantity: parseInt(v.quantity) || 0,
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

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth0.getSession();

        let auth0User = session?.user as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        // Fallback to demo user for development
        if (!auth0User) {
            auth0User = {
                sub: 'demo-user',
                email: 'demo@example.com',
                name: 'Demo User'
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

        // Check if user has manager role for deleting items
        const userRoles = getUserRoles(auth0User);
        const isManager = userRoles.includes('manager');

        if (!isManager) {
            return NextResponse.json({ error: 'Access denied. Manager role required to delete items.' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const merchItemId = searchParams.get('id');

        if (!merchItemId) {
            return NextResponse.json({ error: 'Merch item ID is required' }, { status: 400 });
        }

        // Verify merch item belongs to user's tour
        const merchItem = await db.merchItem.findFirst({
            where: {
                id: merchItemId,
                tour: {
                    managerId: user.id,
                },
            },
        });

        if (!merchItem) {
            return NextResponse.json({ error: 'Merch item not found' }, { status: 404 });
        }

        // Delete the merch item (variants will be deleted by cascade)
        await db.merchItem.delete({
            where: { id: merchItemId },
        });

        return NextResponse.json({ message: 'Merch item deleted successfully' });
    } catch (error) {
        console.error('Error deleting merch item:', error);
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
                name: 'Demo User'
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

        // Check if user has permission to edit quantities (manager or seller)
        const userRoles = getUserRoles(auth0User);
        const isManager = userRoles.includes('manager');
        const isSeller = userRoles.includes('seller');

        if (!isManager && !isSeller) {
            return NextResponse.json({ error: 'Access denied. Manager or Seller role required to edit quantities.' }, { status: 403 });
        }

        const body = await request.json();
        const { id, name, description, imageUrl, variants } = body;

        if (!id) {
            return NextResponse.json({ error: 'Merch item ID is required' }, { status: 400 });
        }

        // Verify merch item belongs to user's tour
        const existingItem = await db.merchItem.findFirst({
            where: {
                id,
                tour: {
                    managerId: user.id,
                },
            },
            include: {
                variants: true,
            },
        });

        if (!existingItem) {
            return NextResponse.json({ error: 'Merch item not found' }, { status: 404 });
        }

        // Update the merch item
        await db.merchItem.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(imageUrl !== undefined && { imageUrl }),
            },
            include: {
                variants: true,
            },
        });

        // Update variants if provided
        if (variants && Array.isArray(variants)) {
            for (const variant of variants) {
                if (variant.id) {
                    // Update existing variant
                    await db.merchVariant.update({
                        where: { id: variant.id },
                        data: {
                            ...(variant.size && { size: variant.size }),
                            ...(variant.type !== undefined && { type: variant.type }),
                            ...(variant.price !== undefined && { price: parseFloat(variant.price) }),
                            ...(variant.quantity !== undefined && { quantity: parseInt(variant.quantity) }),
                        },
                    });
                }
            }
        }

        // Fetch updated item with variants
        const finalItem = await db.merchItem.findUnique({
            where: { id },
            include: {
                variants: true,
            },
        });

        if (finalItem) {
            // Sort variants with proper size ordering
            const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
            
            finalItem.variants.sort((a, b) => {
                // First sort by type
                const typeA = a.type || '';
                const typeB = b.type || '';
                if (typeA !== typeB) {
                    return typeA.localeCompare(typeB);
                }
                
                // Then sort by size using proper order
                const sizeIndexA = sizeOrder.indexOf(a.size.toUpperCase());
                const sizeIndexB = sizeOrder.indexOf(b.size.toUpperCase());
                
                // If size found in order array, use that position
                if (sizeIndexA !== -1 && sizeIndexB !== -1) {
                    return sizeIndexA - sizeIndexB;
                }
                
                // If one or both sizes not in array, fall back to alphabetical
                return a.size.localeCompare(b.size);
            });
        }

        return NextResponse.json(finalItem);
    } catch (error) {
        console.error('Error updating merch item:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
