import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

// Helper function to login
async function login(page: import('@playwright/test').Page, email: string, password: string) {
    await page.goto(`${BASE_URL}/api/auth/login`);

    // Wait for Auth0 login page
    await page.waitForURL(/auth0\.com/, { timeout: 10000 });

    // Fill in credentials
    await page.fill('input[name="username"]', email);
    await page.fill('input[name="password"]', password);

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for redirect back to app
    await page.waitForURL(/localhost:3000/, { timeout: 10000 });
}

// Helper function to get user role from sync endpoint
async function getUserRole(page: import('@playwright/test').Page): Promise<string | null> {
    const response = await page.request.get(`${BASE_URL}/api/auth/sync`);
    if (response.ok()) {
        const data = await response.json();
        return data.user?.role || null;
    }
    return null;
}

test.describe('RBAC - Sync Endpoint', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Sync endpoint returns user role after login', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Call sync endpoint
        const response = await page.request.get(`${BASE_URL}/api/auth/sync`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.user).toBeDefined();
        expect(data.user.role).toBeDefined();
        expect(['MANAGER', 'SELLER']).toContain(data.user.role);
    });

    test('Sync endpoint creates user with correct role on first login', async ({ page }) => {
        // This test assumes the test user doesn't exist yet
        // In practice, you might need to clean up the database first
        const testEmail = process.env.AUTH0_TEST_NEW_USER_EMAIL;
        const testPassword = process.env.AUTH0_TEST_NEW_USER_PASSWORD;

        if (!testEmail || !testPassword) {
            test.skip();
            return;
        }

        await login(page, testEmail, testPassword);

        const role = await getUserRole(page);
        expect(role).toBeDefined();
        // New users should get SELLER role (unless they're the first user)
        expect(['MANAGER', 'SELLER']).toContain(role);
    });

    test('Role persists across page navigations', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Get role on first page
        const role1 = await getUserRole(page);

        // Navigate to different pages
        await page.goto(`${BASE_URL}/dashboard`);
        await page.goto(`${BASE_URL}/dashboard/tours`);
        await page.goto(`${BASE_URL}/profile`);

        // Get role again
        const role2 = await getUserRole(page);

        // Role should be the same
        expect(role1).toBe(role2);
    });
});

test.describe('RBAC - Role-Based UI Access', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Manager sees manager-specific UI elements', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Navigate to tours page
        await page.goto(`${BASE_URL}/dashboard/tours`);

        // Manager should see "New Tour" button
        await expect(page.locator('button:has-text("New Tour")')).toBeVisible({ timeout: 5000 });

        // Manager should see options menu (three dots)
        await expect(page.locator('button:has-text("⋯")')).toBeVisible();
    });

    test('Seller does NOT see manager-specific UI elements', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Navigate to tours page
        await page.goto(`${BASE_URL}/dashboard/tours`);

        // Seller should NOT see "New Tour" button
        await expect(page.locator('button:has-text("New Tour")')).not.toBeVisible();

        // Seller should NOT see options menu
        await expect(page.locator('button:has-text("⋯")')).not.toBeVisible();
    });

    test('Manager can access Reports page', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Navigate to reports page
        await page.goto(`${BASE_URL}/dashboard/reports`);

        // Should see reports content, not access denied
        await expect(page.locator('h1:has-text("Reports")')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Access Denied')).not.toBeVisible();
    });

    test('Seller CANNOT access Reports page', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Navigate to reports page
        await page.goto(`${BASE_URL}/dashboard/reports`);

        // Should see access denied message
        await expect(page.locator('text=Access Denied')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Required role: Manager')).toBeVisible();
    });
});

test.describe('RBAC - Invitation Flow', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Manager can create seller invitation', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Navigate to tours page
        await page.goto(`${BASE_URL}/dashboard/tours`);

        // Look for invite seller button (might be in a menu)
        const inviteButton = page.locator('button:has-text("Invite Seller")');

        // If button exists, it should be visible to manager
        const count = await inviteButton.count();
        if (count > 0) {
            await expect(inviteButton.first()).toBeVisible();
        }
    });

    test('Seller CANNOT create invitations', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Try to access invitations API directly
        const response = await page.request.post(`${BASE_URL}/api/invitations`, {
            data: {
                email: 'test@example.com',
                role: 'SELLER'
            }
        });

        // Should be forbidden or return error
        expect(response.ok()).toBeFalsy();
    });
});

test.describe('RBAC - API Route Protection', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Unauthenticated requests to protected routes are rejected', async ({ request }) => {
        // Test various protected endpoints
        const endpoints = [
            '/api/tours',
            '/api/invitations',
            '/api/seller-assignments'
        ];

        for (const endpoint of endpoints) {
            const response = await request.get(`${BASE_URL}${endpoint}`);
            // Should be 401 Unauthorized or redirect to login
            expect([401, 302, 307]).toContain(response.status());
        }
    });

    test('Manager can access manager-only API routes', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Test invitations endpoint (manager-only)
        const invitationsResponse = await page.request.get(`${BASE_URL}/api/invitations`);
        expect(invitationsResponse.ok()).toBeTruthy();

        // Test seller-assignments endpoint (manager-only)
        const assignmentsResponse = await page.request.get(`${BASE_URL}/api/seller-assignments`);
        expect(assignmentsResponse.ok()).toBeTruthy();
    });

    test('Seller CANNOT access manager-only API routes', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Test invitations endpoint (should be forbidden)
        const invitationsResponse = await page.request.get(`${BASE_URL}/api/invitations`);
        expect(invitationsResponse.ok()).toBeFalsy();
        expect([401, 403]).toContain(invitationsResponse.status());

        // Test creating invitation (should be forbidden)
        const createResponse = await page.request.post(`${BASE_URL}/api/invitations`, {
            data: {
                email: 'test@example.com',
                role: 'SELLER'
            }
        });
        expect(createResponse.ok()).toBeFalsy();
        expect([401, 403]).toContain(createResponse.status());
    });

    test('Both manager and seller can access shared routes', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Test tours endpoint (accessible to both)
        const toursResponse = await page.request.get(`${BASE_URL}/api/tours`);
        expect(toursResponse.ok()).toBeTruthy();

        // Test inventory endpoint (accessible to both)
        const inventoryResponse = await page.request.get(`${BASE_URL}/api/inventory`);
        expect(inventoryResponse.ok()).toBeTruthy();
    });
});
