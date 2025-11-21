'use client';

import { useState, useEffect } from 'react';
import { getCurrentUserType, setUserType } from '@/lib/auth0';

export default function UserSwitcher() {
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Handle hydration correctly to avoid mismatch
    useEffect(() => {
        // This is a legitimate hydration pattern to prevent SSR/client mismatch
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // Get current user type, but only after hydration to avoid SSR/client mismatch
    const currentUserType = mounted ? getCurrentUserType() : 'manager';

    const switchUser = async () => {
        setIsLoading(true);
        const newUserType = currentUserType === 'manager' ? 'seller' : 'manager';
        setUserType(newUserType);
        
        // Refresh the page to update the session
        window.location.reload();
    };

    // Don't render until after hydration to prevent mismatch
    if (!mounted) {
        return (
            <button
                className="switch-user-btn"
                disabled
                style={{ opacity: 0.6 }}
            >
                Loading...
            </button>
        );
    }

    return (
        <button
            onClick={switchUser}
            disabled={isLoading}
            className="switch-user-btn"
            title={`Switch to ${currentUserType === 'manager' ? 'Seller' : 'Manager'}`}
        >
            {isLoading ? '...' : `Switch to ${currentUserType === 'manager' ? 'Seller' : 'Manager'}`}
        </button>
    );
}