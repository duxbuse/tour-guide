import { NextRequest } from "next/server";
import { auth0Client } from "@/lib/auth0";

export async function proxy(request: NextRequest) {
    try {
        return await auth0Client.middleware(request);
    } catch (error) {
        console.error("Proxy Error:", error);
        return new Response("Internal Server Error: " + String(error), { status: 500 });
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
    ]
};
