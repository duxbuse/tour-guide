import db from './db';
import { auth0 } from './auth0';

/**
 * Helper function to get user from database and check their role
 * @param auth0User - The Auth0 user object from session
 * @returns Object containing user and role check functions
 */
export async function getUserWithRole(auth0User: any) {
    if (!auth0User?.sub) {
        return null;
    }

    const user = await db.user.findUnique({
        where: { auth0Id: auth0User.sub },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            auth0Id: true,
        }
    });

    return user;
}

/**
 * Check if user has manager role
 */
export function isManager(user: { role: string } | null): boolean {
    return user?.role === 'MANAGER';
}

/**
 * Check if user has seller role
 */
export function isSeller(user: { role: string } | null): boolean {
    return user?.role === 'SELLER';
}

/**
 * Get user from session and verify they're authenticated
 */
export async function getAuthenticatedUser() {
    const session = await auth0.getSession();

    if (!session?.user) {
        return null;
    }

    return await getUserWithRole(session.user);
}

/**
 * Middleware-style function to require manager role
 * Returns error response if not authorized, null if authorized
 */
export async function requireManager() {
    const user = await getAuthenticatedUser();

    if (!user) {
        return {
            error: 'Unauthorized',
            status: 401
        };
    }

    if (!isManager(user)) {
        return {
            error: 'Access denied. Manager role required.',
            status: 403
        };
    }

    return null; // No error, user is authorized
}
