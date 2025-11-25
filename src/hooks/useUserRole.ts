import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export function useUserRole() {
    const { user, isLoading: authLoading } = useUser();
    const [role, setRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/auth/sync');
                if (response.ok) {
                    const data = await response.json();
                    setRole(data.user.role);
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!authLoading && user) {
            fetchRole();
        } else if (!authLoading && !user) {
            setIsLoading(false);
            setRole(null);
        }
    }, [user, authLoading]);

    return { role, isLoading: isLoading || authLoading };
}
