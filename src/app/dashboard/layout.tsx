'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', label: 'Overview' },
        { href: '/dashboard/tours', label: 'Tours' },
        { href: '/dashboard/inventory', label: 'Inventory' },
        { href: '/dashboard/reports', label: 'Reports' },
        { href: '/dashboard/settings', label: 'Settings' },
    ];

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
            </aside>
            <main className="dashboard-main">
                {children}
            </main>
        </div>
    );
}
