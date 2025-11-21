import { auth0 } from '@/lib/auth0';
import Link from 'next/link';
import Image from 'next/image';

export async function NavBar() {
    const session = await auth0.getSession();
    const user = session?.user;

    return (
        <nav style={{
            borderBottom: '1px solid #e5e7eb',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'white'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'none', color: 'black' }}>
                    🎸 Tour Guide
                </Link>

                {user && (
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <Link href="/dashboard" style={{ textDecoration: 'none', color: '#4b5563' }}>
                            Dashboard
                        </Link>
                        <Link href="/dashboard/tours" style={{ textDecoration: 'none', color: '#4b5563' }}>
                            Tours
                        </Link>
                    </div>
                )}
            </div>

            <div>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>{user.name}</span>
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{user.email}</span>
                        </div>
                        {user.picture && (
                            <Image
                                src={user.picture}
                                alt={user.name || 'User'}
                                width={32}
                                height={32}
                                style={{ borderRadius: '50%' }}
                            />
                        )}
                        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                        <a
                            href="/api/auth/logout"
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '0.375rem',
                                textDecoration: 'none',
                                color: '#374151',
                                fontSize: '0.875rem'
                            }}
                        >
                            Logout
                        </a>
                    </div>
                ) : (
                    // eslint-disable-next-line @next/next/no-html-link-for-pages
                    <a
                        href="/api/auth/login"
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'black',
                            color: 'white',
                            borderRadius: '0.375rem',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}
                    >
                        Log In
                    </a>
                )}
            </div>
        </nav>
    );
}
