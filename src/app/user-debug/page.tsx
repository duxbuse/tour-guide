'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

export default function DebugUserPage() {
    const { user, isLoading, error } = useUser();

    if (isLoading) {
        return <div style={{ padding: '2rem' }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ padding: '2rem', color: 'red' }}>Error: {error.message}</div>;
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h1>User Debug Info</h1>

            <h2>User Object:</h2>
            <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(user, null, 2)}
            </pre>

            <h2>Roles Check:</h2>
            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
                <p><strong>Custom Roles (https://tour-guide.app/roles):</strong></p>
                <pre>{JSON.stringify((user as any)?.['https://tour-guide.app/roles'], null, 2)}</pre>

                <p style={{ marginTop: '1rem' }}><strong>Standard Roles:</strong></p>
                <pre>{JSON.stringify((user as any)?.roles, null, 2)}</pre>
            </div>
        </div>
    );
}
