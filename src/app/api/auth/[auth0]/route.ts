import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { auth0: string } }
) {
    const { auth0 } = await params;

    if (auth0 === 'login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (auth0 === 'logout') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (auth0 === 'me') {
        return NextResponse.json({
            user: {
                sub: 'demo-user',
                name: 'Demo User',
                email: 'demo@example.com',
                picture: 'https://github.com/shadcn.png'
            }
        });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
