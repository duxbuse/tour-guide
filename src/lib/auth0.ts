import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Validate required environment variables
if (!process.env.AUTH0_SECRET) {
    throw new Error('AUTH0_SECRET is required');
}

if (!process.env.AUTH0_BASE_URL) {
    throw new Error('AUTH0_BASE_URL is required');
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

// Auth0Client automatically reads from environment variables
// AUTH0_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, 
// AUTH0_CLIENT_ID, and AUTH0_CLIENT_SECRET
export const auth0Client = new Auth0Client();

export const auth0 = auth0Client;
