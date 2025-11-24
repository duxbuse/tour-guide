import { auth0 } from '@/lib/auth0';
import db from '@/lib/db';
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

    // Get user from database to check role
    const user = await db.user.findUnique({
        where: { auth0Id: session.user.sub }
    });

    // If user doesn't exist in database, create them with Manager role
    if (!user) {
        const newUser = await db.user.create({
            data: {
                auth0Id: session.user.sub,
                email: session.user.email!,
                name: session.user.name || session.user.email!,
                role: 'MANAGER', // Default role for new users
            }
        });

        // Check if new user has access
        const hasAccess = allowedRoles.some(role =>
            role.toLowerCase() === newUser.role.toLowerCase()
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
                        Your role: {newUser.role}
                    </p>
                </div>
            );
        }

        return <>{children}</>;
    }

    // Check if user has one of the allowed roles
    const hasAccess = allowedRoles.some(role =>
        role.toLowerCase() === user.role.toLowerCase()
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
                    Your role: {user.role}
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
