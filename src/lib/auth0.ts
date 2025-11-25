import { Auth0Client } from '@auth0/nextjs-auth0/server';

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

export const auth0Client = new Auth0Client({
    secret: process.env.AUTH0_SECRET,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
});

export const auth0 = auth0Client;
