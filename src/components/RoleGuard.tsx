import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import React from 'react';

type Role = 'Manager' | 'Seller';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: Role[];
}

export async function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const session = await auth0.getSession();

    if (!session) {
        redirect('/api/auth/login');
    }

    // Note: This depends on the Auth0 Action adding roles to the user object
    // The namespace should match what was configured in the Auth0 Action
    const userRoles = (session.user['https://tour-guide.app/roles'] as string[]) || [];

    // Also check for roles in the standard location if the custom claim isn't present
    // This is a fallback in case the Action isn't set up exactly as described
    const standardRoles = ((session.user as any).roles as string[]) || []; // eslint-disable-line @typescript-eslint/no-explicit-any

    const allUserRoles = [...userRoles, ...standardRoles];

    const hasAccess = allowedRoles.some(role =>
        allUserRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())
    );

    if (!hasAccess) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>Access Denied</h2>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
                    You do not have permission to view this page.
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Required roles: {allowedRoles.join(', ')}
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
