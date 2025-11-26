import { auth0Client } from '@/lib/auth0';
import { NextRequest } from 'next/server';

/**
 * IMPORTANT: DO NOT DELETE THIS FILE OR REVERT TO USING MIDDLEWARE.TS!
 * 
 * The root middleware approach is deprecated/sunset for this project setup.
 * This route handler acts as a proxy for Auth0 authentication routes, delegating
 * logic to the Auth0 SDK's middleware method within the API route context.
 * 
 * This handles:
 * - /api/auth/login
 * - /api/auth/logout
 * - /api/auth/callback
 * - /api/auth/me
 */

export async function GET(request: NextRequest) {
    console.log(`Auth0 Proxy GET: ${request.nextUrl.pathname}`);
    try {
        const response = await auth0Client.middleware(request);
        console.log(`Auth0 Proxy Response Status: ${response.status}`);

        // Prevent caching of login redirects to ensure fresh state parameters
        if (request.nextUrl.pathname === '/api/auth/login' && response.status === 307) {
            const newResponse = new Response(response.body, response);
            newResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            newResponse.headers.set('Pragma', 'no-cache');
            newResponse.headers.set('Expires', '0');
            console.log('Login: Added no-cache headers to prevent state reuse');
            return newResponse;
        }

        // If this is a logout request, ensure transaction cookies are cleared
        if (request.nextUrl.pathname === '/api/auth/logout' && response.status === 307) {
            const newResponse = new Response(response.body, response);
            newResponse.headers.append('Set-Cookie', 'auth_verification=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax');
            newResponse.headers.append('Set-Cookie', 'appSession=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax');
            console.log('Logout: Explicitly cleared transaction cookies');
            return newResponse;
        }

        if (response.status >= 400) {
            const clonedResponse = response.clone();
            try {
                const text = await clonedResponse.text();
                console.error('Auth0 Proxy Error Response Body:', text);
            } catch (e) {
                console.error('Failed to read error response body:', e);
            }
        }

        return response;
    } catch (error) {
        console.error('Auth0 Proxy GET Error Details:', {
            message: (error as Error).message,
            stack: (error as Error).stack,
            error
        });
        return new Response(`Internal Server Error: ${(error as Error).message}`, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        return await auth0Client.middleware(request);
    } catch (error) {
        console.error('Auth0 Proxy POST Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
