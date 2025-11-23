'use client';

import { useState, useEffect } from 'react';
import { setDemoUserType, getDemoUserType, isDemoMode } from '@/lib/auth0';

export default function UserSwitcher() {
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showSwitcher, setShowSwitcher] = useState(false);

    useEffect(() => {
        setMounted(true);
        setShowSwitcher(isDemoMode());
    }, []);

    if (!mounted || !showSwitcher) return null;

    const currentUserType = getDemoUserType();

    const switchUser = async () => {
        setIsLoading(true);
        const newUserType = currentUserType === 'manager' ? 'seller' : 'manager';
        setDemoUserType(newUserType);

        // Refresh the page to update the session
        window.location.reload();
    };

    return (
        <button
            onClick={switchUser}
            disabled={isLoading}
            className="switch-user-btn"
            title={`Switch to ${currentUserType === 'manager' ? 'Seller' : 'Manager'} (Demo)`}
        >
            {isLoading ? (
                '...'
            ) : (
                <>
                    Switch to {currentUserType === 'manager' ? 'Seller' : 'Manager'}{' '}
                    <span style={{ color: 'red' }}>(Demo Only)</span>
                </>
            )}
        </button>
    );
}