'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { setUserType, getCurrentUserType } from "@/lib/auth0";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Start with a consistent default to avoid hydration mismatch
    const [currentUserType, setCurrentUserTypeState] = useState<'manager' | 'seller'>('manager');
    const [mounted, setMounted] = useState(false);

    // Update user type from localStorage after component mounts (client-side only)
    useEffect(() => {
        const stored = localStorage.getItem('tour-guide-user-type');
        if (stored === 'seller') {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setCurrentUserTypeState('seller'); // Legitimate case: syncing with external localStorage state
        }
        setMounted(true);
    }, []);

    const users = {
        manager: {
            name: 'Tour Manager',
            email: 'manager@test.com',
            roles: ['manager']
        },
        seller: {
            name: 'Tour Seller',
            email: 'seller@test.com',
            roles: ['seller']
        }
    };

    const user = users[currentUserType];
    const isManager = user?.roles.includes('manager');

    // Filter navigation items based on user role - only apply filtering on client side
    const allNavItems = [
        { href: '/dashboard', label: 'Overview' },
        { href: '/dashboard/tours', label: 'Tours' },
        { href: '/dashboard/inventory', label: 'Inventory' },
        { href: '/dashboard/reports', label: 'Reports', managerOnly: true },
    ];

    // Only filter after component is mounted to prevent hydration mismatch
    const navItems = mounted
        ? allNavItems.filter(item => !item.managerOnly || isManager)
        : allNavItems; // Show all during SSR, filter on client

    const [loading] = useState(false);

    const handleUserSwitch = (userType: 'manager' | 'seller') => {
        setUserType(userType);
        setCurrentUserTypeState(userType);
        // Force a page refresh to update permissions and backend state
        window.location.reload();
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)'
            }}>
                <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
                    <h1 style={{ marginBottom: '2rem' }}>Tour Guide</h1>
                    <p style={{ marginBottom: '2rem' }}>Please log in to access the dashboard</p>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a
                        href="/api/auth/login"
                        className="btn btn-primary"
                        style={{ textDecoration: 'none' }}
                    >
                        Log In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-accent)', marginBottom: '2rem' }}>
                    Tour<span style={{ color: 'var(--accent-primary)' }}>Guide</span>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                
                {/* User Info and Controls */}
                <div style={{
                    marginTop: 'auto',
                    padding: '1rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    {/* User Switcher */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                            Switch User
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                                onClick={() => handleUserSwitch('manager')}
                                style={{
                                    fontSize: '0.675rem',
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: currentUserType === 'manager' ? 'var(--accent-primary)' : 'transparent',
                                    color: currentUserType === 'manager' ? 'white' : 'var(--text-secondary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Manager
                            </button>
                            <button
                                onClick={() => handleUserSwitch('seller')}
                                style={{
                                    fontSize: '0.675rem',
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: currentUserType === 'seller' ? 'var(--accent-primary)' : 'transparent',
                                    color: currentUserType === 'seller' ? 'white' : 'var(--text-secondary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Seller
                            </button>
                        </div>
                    </div>

                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {user.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {user.email}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-tertiary)' }}>
                        Role: {user.roles[0]}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a
                        href="/api/auth/logout"
                        style={{
                            fontSize: '0.75rem',
                            color: 'var(--accent-secondary)',
                            textDecoration: 'none',
                            marginTop: '0.5rem'
                        }}
                    >
                        Logout
                    </a>
                </div>
            </aside>
            <main className="dashboard-main">
                {children}
            </main>
        </div>
    );
}
