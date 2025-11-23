import db from './db';

/**
 * Check if a seller has access to a specific show
 */
export async function checkSellerShowAccess(
    userId: string,
    showId: string
): Promise<boolean> {
    const assignment = await db.sellerAssignment.findUnique({
        where: {
            sellerId_showId: {
                sellerId: userId,
                showId: showId,
            },
        },
    });

    return assignment !== null;
}

/**
 * Get all shows assigned to a seller
 */
export async function getSellerAssignedShows(userId: string) {
    const assignments = await db.sellerAssignment.findMany({
        where: {
            sellerId: userId,
        },
        include: {
            show: {
                include: {
                    tour: true,
                },
            },
        },
    });

    return assignments.map((a) => a.show);
}

/**
 * Get all sellers assigned to a show
 */
export async function getShowAssignments(showId: string) {
    const assignments = await db.sellerAssignment.findMany({
        where: {
            showId: showId,
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
        },
    });

    return assignments.map((a) => a.seller);
}

/**
 * Generate a secure invitation token
 */
export function generateInvitationToken(): string {
    // Generate a random token using crypto
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
        ''
    );
}

/**
 * Get all show IDs assigned to a seller (for quick filtering)
 */
export async function getSellerAssignedShowIds(
    userId: string
): Promise<string[]> {
    const assignments = await db.sellerAssignment.findMany({
        where: {
            sellerId: userId,
        },
        select: {
            showId: true,
        },
    });

    return assignments.map((a) => a.showId);
}
