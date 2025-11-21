// Mock Auth0 client for development
// In production, replace with: import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Simple user storage for demo switching with localStorage persistence
const getUserTypeFromStorage = (): 'manager' | 'seller' => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('tour-guide-user-type');
        return stored === 'seller' ? 'seller' : 'manager';
    }
    return 'manager';
};

export const setUserType = (userType: 'manager' | 'seller') => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('tour-guide-user-type', userType);
    }
};

export const getCurrentUserType = () => getUserTypeFromStorage();

export const auth0 = {
    getSession: async () => {
        const currentUserType = getUserTypeFromStorage();
        
        const users = {
            manager: {
                sub: 'auth0|manager-user-id',
                email: process.env.AUTH0_MANAGER_EMAIL || 'manager@test.com',
                name: 'Tour Manager',
                picture: 'https://github.com/shadcn.png',
                'https://tour-guide.app/roles': ['Manager']
            },
            seller: {
                sub: 'auth0|seller-user-id',
                email: process.env.AUTH0_SELLER_EMAIL || 'seller@test.com',
                name: 'Tour Seller',
                picture: 'https://github.com/shadcn.png',
                'https://tour-guide.app/roles': ['Seller']
            }
        };

        return {
            user: users[currentUserType]
        };
    }
};
