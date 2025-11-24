import { auth0 } from '@/lib/auth0';

export default async function ServerDebugPage() {
    const session = await auth0.getSession();

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Server-Side Debug</h1>

            <div style={{ marginTop: '2rem' }}>
                <h2>Session Exists:</h2>
                <p style={{ fontSize: '1.5rem', color: session ? 'green' : 'red' }}>
                    {session ? 'YES ✓' : 'NO ✗'}
                </p>
            </div>

            {session && (
                <>
                    <div style={{ marginTop: '2rem' }}>
                        <h2>User Object:</h2>
                        <pre style={{
                            background: '#1e1e1e',
                            padding: '1rem',
                            borderRadius: '8px',
                            overflow: 'auto',
                            maxHeight: '600px'
                        }}>
                            {JSON.stringify(session.user, null, 2)}
                        </pre>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <h2>Role Checks:</h2>
                        <div style={{ background: '#1e1e1e', padding: '1rem', borderRadius: '8px' }}>
                            <p><strong>Custom Namespace Roles:</strong></p>
                            <pre>{JSON.stringify(session.user['https://tour-guide.app/roles'], null, 2)}</pre>

                            <p style={{ marginTop: '1rem' }}><strong>Standard Roles:</strong></p>
                            <pre>{JSON.stringify((session.user as any).roles, null, 2)}</pre>
                        </div>
                    </div>
                </>
            )}

            <div style={{ marginTop: '2rem' }}>
                <a href="/debug" style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    marginRight: '1rem'
                }}>
                    Client Debug
                </a>
                <a href="/dashboard" style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--accent-secondary)',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none'
                }}>
                    Dashboard
                </a>
            </div>
        </div>
    );
}
