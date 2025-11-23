'use client';

import Link from 'next/link';

export default function HomeActions() {
    return (
        <div className="home-actions">
            <button
                onClick={() => {
                    // Clear demo mode for real auth
                    document.cookie = "demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "demo_user_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    window.location.href = "/api/auth/login";
                }}
                className="btn btn-primary"
            >
                Get Started
            </button>
            <button
                onClick={() => {
                    // Set demo mode cookies
                    document.cookie = "demo_mode=true; path=/; max-age=86400";
                    if (!document.cookie.includes('demo_user_type')) {
                        document.cookie = "demo_user_type=manager; path=/; max-age=86400";
                    }
                    window.location.href = "/dashboard";
                }}
                className="btn btn-secondary"
            >
                View Demo
            </button>
            <Link
                href="/pricing"
                className="btn btn-secondary"
                style={{ marginLeft: '0.5rem' }}
            >
                Pricing
            </Link>
        </div>
    );
}
