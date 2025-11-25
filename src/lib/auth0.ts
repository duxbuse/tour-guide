import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Dynamically construct the base URL for the application
// This supports Vercel preview deployments, PR deployments, and production
const getBaseUrl = (): string => {
    // For Vercel deployments (including preview/PR deployments)
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Alternative Vercel URL (public-facing)
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }

    // Explicit base URL (for production or custom domains)
    if (process.env.AUTH0_BASE_URL) {
        return process.env.AUTH0_BASE_URL;
    }

    // Fallback for local development
    return 'http://localhost:3000';
};

// Validate required environment variables (skip during build)
const validateEnvVars = () => {
    if (!process.env.AUTH0_SECRET) {
        throw new Error('AUTH0_SECRET is required');
    }

    if (!process.env.AUTH0_ISSUER_BASE_URL) {
        throw new Error('AUTH0_ISSUER_BASE_URL is required');
    }

    if (!process.env.AUTH0_CLIENT_ID) {
        throw new Error('AUTH0_CLIENT_ID is required');
    }

    if (!process.env.AUTH0_CLIENT_SECRET) {
        throw new Error('AUTH0_CLIENT_SECRET is required');
    }
};

// Lazy initialization - client is created at runtime, not build time
let _auth0Client: Auth0Client | null = null;

const getAuth0Client = (): Auth0Client => {
    if (!_auth0Client) {
        validateEnvVars();
        _auth0Client = new Auth0Client({
            appBaseUrl: getBaseUrl(),
        });
    }
    return _auth0Client;
};

// Export a getter that creates the client on first access
export const auth0Client = new Proxy({} as Auth0Client, {
    get(target, prop) {
        const client = getAuth0Client();
        const value = (client as any)[prop];
        return typeof value === 'function' ? value.bind(client) : value;
    }
});

export const auth0 = auth0Client;
