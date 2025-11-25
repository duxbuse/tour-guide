import { auth0Client } from '@/lib/auth0';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
    try {
        const client = (auth0Client as unknown as { authClient?: { handler?: (req: NextRequest) => Promise<NextResponse> } }).authClient;
        if (!client || !client.handler) {
            return new NextResponse("Auth0Client internal structure mismatch. authClient not found.", { status: 500 });
        }
        return await client.handler(req);
    } catch (e: unknown) {
        console.error("Auth0 Callback Error:", e);
        const error = e as { message?: string; stack?: string };
        return NextResponse.json({ error: error?.message || String(e), stack: error?.stack }, { status: 500 });
    }
};
