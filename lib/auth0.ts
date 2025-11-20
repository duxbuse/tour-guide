// Mock Auth0 client for development
// In production, replace with: import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = {
    getSession: async () => {
        // Return null to trigger demo user fallback in API routes
        return null;
    }
};
