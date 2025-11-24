import { auth0Client } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export const GET = async (req: any) => {
    try {
        const client = (auth0Client as any).authClient;
        if (!client || !client.handler) {
            return new NextResponse("Auth0Client internal structure mismatch. authClient not found.", { status: 500 });
        }
        return await client.handler(req);
    } catch (e: any) {
        console.error("Auth0 Callback Error:", e);
        return NextResponse.json({ error: e?.message || String(e), stack: e?.stack }, { status: 500 });
    }
};
