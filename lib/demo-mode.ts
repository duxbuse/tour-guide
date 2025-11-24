// Client-side helpers for demo mode switching
export const setDemoMode = (enabled: boolean) => {
    if (typeof window !== 'undefined') {
        if (enabled) {
            document.cookie = "demo_mode=true; path=/; max-age=86400"; // 1 day
            // Default to manager if not set
            if (!document.cookie.includes('demo_user_type')) {
                document.cookie = "demo_user_type=manager; path=/; max-age=86400";
            }
        } else {
            document.cookie = "demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "demo_user_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
};

export const setDemoUserType = (userType: 'manager' | 'seller') => {
    if (typeof window !== 'undefined') {
        document.cookie = `demo_user_type=${userType}; path=/; max-age=86400`;
    }
};

export const getDemoUserType = (): 'manager' | 'seller' => {
    if (typeof window !== 'undefined') {
        const match = document.cookie.match(new RegExp('(^| )demo_user_type=([^;]+)'));
        if (match) return match[2] as 'manager' | 'seller';
    }
    return 'manager';
};

export const isDemoMode = (): boolean => {
    if (typeof window !== 'undefined') {
        return document.cookie.includes('demo_mode=true');
    }
    return false;
};
