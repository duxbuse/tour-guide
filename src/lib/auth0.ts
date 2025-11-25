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

// Validate required environment variables
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

// Create Auth0 client with dynamic base URL
export const auth0Client = new Auth0Client({
    appBaseUrl: getBaseUrl(),
});

export const auth0 = auth0Client;
