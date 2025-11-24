import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

/**
 * Simplified RBAC tests that focus on database role checking
 * These tests verify the RBAC implementation without requiring Auth0 login
 */

test.describe('RBAC - API Route Protection', () => {
    test('Unauthenticated request to /api/invitations redirects or returns 401', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/invitations`);

        // Should redirect to Auth0 login (302/307) or return 401
        expect([302, 307, 401]).toContain(response.status());
    });

    test('Unauthenticated request to /api/seller-assignments redirects or returns 401', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/seller-assignments`);

        // Should redirect to Auth0 login or return 401
        expect([302, 307, 401]).toContain(response.status());
    });

    test('Unauthenticated POST to /api/invitations redirects or returns 401', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/api/invitations`, {
            data: {
                email: 'test@example.com',
                role: 'SELLER'
            }
        });

        // Should redirect to Auth0 login or return 401
        expect([302, 307, 401]).toContain(response.status());
    });
});

test.describe('RBAC - Sync Endpoint', () => {
    test('Unauthenticated request to /api/auth/sync returns 401', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/auth/sync`);

        // Sync endpoint should return 401 (not redirect)
        expect(response.status()).toBe(401);

        const data = await response.json();
        expect(data.error).toBeDefined();
    });
});

test.describe('RBAC - Public Pages', () => {
    test('Home page is accessible without authentication', async ({ page }) => {
        await page.goto(`${BASE_URL}/`);

        // Should see home page content
        await expect(page.locator('text=Tour Guide')).toBeVisible({ timeout: 5000 });
    });

    test('Pricing page is accessible without authentication', async ({ page }) => {
        await page.goto(`${BASE_URL}/pricing`);

        // Should see pricing page
        await expect(page).toHaveURL(/pricing/);
    });
});

test.describe('RBAC - Protected Pages Redirect', () => {
    test('Dashboard redirects unauthenticated users', async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard`);

        // Wait for any redirects to complete
        await page.waitForLoadState('networkidle');

        const url = page.url();
        // Should be redirected to Auth0 or another login page
        const isRedirected = url.includes('auth0.com') || url.includes('/api/auth/login') || !url.includes('/dashboard');
        expect(isRedirected).toBeTruthy();
    });

    test('Reports page redirects unauthenticated users', async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/reports`);

        await page.waitForLoadState('networkidle');

        const url = page.url();
        // Should be redirected away from reports page
        const isRedirected = url.includes('auth0.com') || url.includes('/api/auth/login') || !url.includes('/dashboard/reports');
        expect(isRedirected).toBeTruthy();
    });
});
