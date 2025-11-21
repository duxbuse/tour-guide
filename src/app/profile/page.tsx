import { auth0 } from '@/lib/auth0';
import Link from 'next/link';
import Image from 'next/image';

export default async function ProfilePage() {
    const session = await auth0.getSession();

    if (!session) {
        return (
            <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
                <h1>Not Logged In</h1>
                <p>You need to log in to view this page.</p>
                <Link href="/api/auth/login" style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: '#0070f3',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    marginTop: '1rem'
                }}>
                    Log In
                </Link>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
            <h1>Profile</h1>
            <div style={{ marginBottom: '2rem' }}>
                <Image
                    src={session.user.picture}
                    alt={session.user.name || 'User'}
                    width={80}
                    height={80}
                    style={{ borderRadius: '50%' }}
                />
                <h2>{session.user.name}</h2>
                <p>{session.user.email}</p>
            </div>

            <h3>Session Data</h3>
            <pre style={{
                background: '#f5f5f5',
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto'
            }}>
                {JSON.stringify(session.user, null, 2)}
            </pre>

            <Link href="/api/auth/logout" style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: '#ff4444',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                marginTop: '1rem'
            }}>
                Log Out
            </Link>
        </div>
    );
}
