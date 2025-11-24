'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import UserSwitcher from './UserSwitcher';
import { isDemoMode, getDemoUserType } from '@/lib/demo-mode';

interface User {
    name?: string;
    email?: string;
    picture?: string;
}

interface UserInfoProps {
    user?: User | null;
}

export default function UserInfo({ user }: UserInfoProps) {
    const [isDemo, setIsDemo] = useState(false);
    const [demoType, setDemoType] = useState<'manager' | 'seller'>('manager');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setIsDemo(isDemoMode());
        setDemoType(getDemoUserType());
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // If not logged in and not in demo mode, show login button
    if (!user && !isDemo) {
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        return <a href="/api/auth/login" className="btn btn-primary">Log In</a>;
    }

    // Determine display values
    const displayName = isDemo ? (demoType === 'manager' ? 'Tour Manager' : 'Merch Seller') : user?.name;
    const displayEmail = isDemo ? (demoType === 'manager' ? 'manager@test.com' : 'seller@test.com') : user?.email;
    const displayPicture = isDemo ? null : user?.picture;

    return (
        <div className="navbar-user">
            <div className="user-info">
                <span className="user-name">{displayName}</span>
                <span className="user-email">{displayEmail}</span>
            </div>
            <Image
                src={displayPicture || '/logo-v2.svg'}
                alt={displayName || 'User'}
                width={32}
                height={32}
                className="user-avatar"
                style={{ objectFit: 'cover', background: 'var(--bg-secondary)' }}
            />
            <UserSwitcher />
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api/auth/logout" className="logout-btn">
                Logout
            </a>
        </div>
    );
}