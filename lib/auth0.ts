import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { cookies } from 'next/headers';

export const auth0Client = new Auth0Client({
    routes: {
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        callback: '/api/auth/callback'
    },
    signInReturnToPath: '/dashboard',
    session: {
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        }
    },
    transactionCookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
});



// Mock users for demo mode
const DEMO_USERS = {
    manager: {
        sub: 'auth0|691f989d2bc713054fec2340',
        email: 'manager@test.com',
        name: 'Tour Manager',
        picture: 'https://github.com/shadcn.png',
        'https://tour-guide.app/roles': ['Manager']
    },
    seller: {
        sub: 'auth0|seller-user-id',
        email: 'seller@test.com',
        name: 'Tour Seller',
        picture: 'https://github.com/shadcn.png',
        'https://tour-guide.app/roles': ['Seller']
    }
};

export const auth0 = {
    getSession: async () => {
        // Check for demo mode cookie
        const cookieStore = await cookies();
        const isDemoMode = cookieStore.get('demo_mode')?.value === 'true';

        if (isDemoMode) {
            const userType = (cookieStore.get('demo_user_type')?.value as 'manager' | 'seller') || 'manager';
            return {
                user: DEMO_USERS[userType]
            };
        }

        // Real Auth0 session
        try {
            return await auth0Client.getSession();
        } catch (error) {
            // If getSession fails (e.g. not logged in), return null
            return null;
        }
    }
};

