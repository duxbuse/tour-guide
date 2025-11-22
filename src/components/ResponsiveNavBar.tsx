'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import UserInfo from './UserInfo';

interface ResponsiveNavBarProps {
    user: any;
}

export default function ResponsiveNavBar({ user }: ResponsiveNavBarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    const closeMenu = () => {
        setIsOpen(false);
        document.body.style.overflow = 'unset';
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link href="/" className="navbar-brand" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Image src="/logo.svg" alt="Tour Guide Logo" width={40} height={40} priority />
                    <span>Tour Guide</span>
                </Link>

                {user && (
                    <div className="navbar-nav desktop-only">
                        <Link href="/dashboard" className="nav-link">
                            Dashboard
                        </Link>
                        <Link href="/dashboard/tours" className="nav-link">
                            Tours
                        </Link>
                        <Link href="/dashboard/inventory" className="nav-link">
                            Inventory
                        </Link>
                        <Link href="/dashboard/reports" className="nav-link">
                            Reports
                        </Link>
                    </div>
                )}
            </div>

            <div className="navbar-right desktop-only">
                <UserInfo />
            </div>

            <button
                className="mobile-menu-btn mobile-only"
                onClick={toggleMenu}
                aria-label="Toggle menu"
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                )}
            </button>

            <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: '0.5rem',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid var(--border-subtle)'
                    }}>
                        <button
                            onClick={closeMenu}
                            style={{
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '2px solid var(--accent-primary)',
                                color: 'var(--accent-primary)',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease',
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                            }}
                            aria-label="Close menu"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--accent-primary)';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                e.currentTarget.style.color = 'var(--accent-primary)';
                            }}
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    {user && (
                        <div className="mobile-nav-links">
                            <Link href="/dashboard" className="mobile-nav-link" onClick={closeMenu}>
                                Dashboard
                            </Link>
                            <Link href="/dashboard/tours" className="mobile-nav-link" onClick={closeMenu}>
                                Tours
                            </Link>
                            <Link href="/dashboard/inventory" className="mobile-nav-link" onClick={closeMenu}>
                                Inventory
                            </Link>
                            <Link href="/dashboard/reports" className="mobile-nav-link" onClick={closeMenu}>
                                Reports
                            </Link>
                        </div>
                    )}
                    <div className="mobile-user-info">
                        <UserInfo />
                    </div>
                </div>
            </div>
        </nav>
    );
}
