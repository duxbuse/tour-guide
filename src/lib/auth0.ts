import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { cookies } from 'next/headers';

// Lazy initialization - client is created at runtime
let _auth0Client: Auth0Client | null = null;

function getAuth0Client(): Auth0Client {
    if (!_auth0Client) {
        console.log('Initializing Auth0Client...');

        // On Vercel, let Auth0 SDK auto-detect the URL from request headers
        // VERCEL_URL is only available at build time, not runtime
        const isVercel = process.env.VERCEL === '1';

        let config: any = {
            routes: {
                login: '/api/auth/login',
                logout: '/api/auth/logout',
                callback: '/api/auth/callback'
            },
            signInReturnToPath: '/dashboard',
            session: {
                cookie: {
                    secure: true,
                    sameSite: 'lax'
                }
            },
            transactionCookie: {
                secure: true,
                sameSite: 'lax'
            }
        };

        // Only set appBaseUrl for local development
        if (!isVercel) {
            const baseUrl = process.env.AUTH0_BASE_URL || 'https://localhost:3000';
            config.appBaseUrl = baseUrl;
            console.log('Auth0 Base URL (local):', baseUrl);
        } else {
            console.log('Auth0 running on Vercel - auto-detecting URL from request');
        }

        _auth0Client = new Auth0Client(config);
        console.log('Auth0Client initialized successfully');
    }
    return _auth0Client;
}

// Export client with lazy getter
export const auth0Client = new Proxy({} as Auth0Client, {
    get(_, prop) {
        const client = getAuth0Client();
        const value = (client as any)[prop]; // eslint-disable-line @typescript-eslint/no-explicit-any
        return typeof value === 'function' ? value.bind(client) : value;
    }
});

// Mock users for demo mode
const DEMO_USERS = {
    manager: {
        sub: 'auth0|691f989d2bc713054fec2340',
        email: 'manager@test.com',
        name: 'Tour Manager',
        picture: 'https://github.com/shadcn.png',
        'https://tour-guide.app/roles': ['Manager'],
        roles: ['Manager']
    },
    seller: {
        sub: 'auth0|seller-user-id',
        email: 'seller@test.com',
        name: 'Tour Seller',
        picture: 'https://github.com/shadcn.png',
        'https://tour-guide.app/roles': ['Seller'],
        roles: ['Seller']
    }
};

// Export auth wrapper with demo mode support
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
        } catch {
            // If getSession fails (e.g. not logged in), return null
            return null;
        }
    }
};
