import { auth0 } from '@/lib/auth0';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
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

    // Get user from database to check role
    let user = await db.user.findUnique({
        where: { auth0Id: session.user.sub }
    });

    // If user doesn't exist in database, create them with Manager role
    if (!user) {
        user = await db.user.create({
            data: {
                auth0Id: session.user.sub,
                email: session.user.email!,
                name: session.user.name || session.user.email!,
                role: 'MANAGER', // Default role for new users
            }
        });
    }

    // Check for demo mode override
    const cookieStore = await cookies();
    const isDemo = cookieStore.get('demo_mode')?.value === 'true';
    const demoUserType = cookieStore.get('demo_user_type')?.value;

    const userRole = (isDemo && demoUserType) ? demoUserType : user.role;

    // Check if user has one of the allowed roles
    const hasAccess = allowedRoles.some(role =>
        role.toLowerCase() === userRole.toLowerCase()
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
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Your role: {userRole}
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
