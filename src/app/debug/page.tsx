'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

export default function DebugPage() {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Debug User Session</h1>

            <div style={{ marginTop: '2rem' }}>
                <h2>User Object:</h2>
                <pre style={{
                    background: '#1e1e1e',
                    padding: '1rem',
                    borderRadius: '8px',
                    overflow: 'auto',
                    maxHeight: '600px'
                }}>
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h2>Role Checks:</h2>
                <div style={{ background: '#1e1e1e', padding: '1rem', borderRadius: '8px' }}>
                    <p><strong>Custom Namespace Roles:</strong></p>
                    <pre>{JSON.stringify(user?.['https://tour-guide.app/roles'], null, 2)}</pre>

                    <p style={{ marginTop: '1rem' }}><strong>Standard Roles:</strong></p>
                    <pre>{JSON.stringify((user as any)?.roles, null, 2)}</pre>

                    <p style={{ marginTop: '1rem' }}><strong>App Metadata:</strong></p>
                    <pre>{JSON.stringify((user as any)?.app_metadata, null, 2)}</pre>

                    <p style={{ marginTop: '1rem' }}><strong>User Metadata:</strong></p>
                    <pre>{JSON.stringify((user as any)?.user_metadata, null, 2)}</pre>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <a href="/dashboard" style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none'
                }}>
                    Back to Dashboard
                </a>
            </div>
        </div>
    );
}
