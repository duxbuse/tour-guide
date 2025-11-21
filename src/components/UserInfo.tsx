'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { auth0 } from '@/lib/auth0';
import UserSwitcher from './UserSwitcher';

interface User {
    name?: string;
    email?: string;
    picture?: string;
}

export default function UserInfo() {
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            try {
                const session = await auth0.getSession();
                setUser(session?.user || null);
            } catch (error) {
                console.error('Error getting session:', error);
                setUser(null);
            } finally {
                setMounted(true);
            }
        };

        getUser();
    }, []);

    // Show loading placeholder during SSR and initial hydration
    if (!mounted) {
        return (
            <div className="navbar-user">
                <div className="user-info">
                    <div className="loading-skeleton skeleton-text" style={{ width: '120px', height: '1rem' }}></div>
                    <div className="loading-skeleton skeleton-text" style={{ width: '140px', height: '0.875rem', marginTop: '0.25rem' }}></div>
                </div>
                <div className="loading-skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }}></div>
                <div className="loading-skeleton skeleton-text" style={{ width: '100px', height: '0.875rem' }}></div>
                <div className="loading-skeleton skeleton-text" style={{ width: '60px', height: '0.875rem' }}></div>
            </div>
        );
    }

    if (!user) {
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        return <a href="/api/auth/login" className="btn btn-primary">Log In</a>;
    }

    return (
        <div className="navbar-user">
            <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
            </div>
            {user.picture && (
                <Image
                    src={user.picture}
                    alt={user.name || 'User'}
                    width={32}
                    height={32}
                    className="user-avatar"
                />
            )}
            <UserSwitcher />
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api/auth/logout" className="logout-btn">
                Logout
            </a>
        </div>
    );
}