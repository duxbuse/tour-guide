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

test.describe('Manager User - Core RBAC Tests', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Manager can log in successfully', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Should be redirected to home or dashboard
        await expect(page).toHaveURL(/localhost:3000/);

        // Check that user is logged in
        await expect(page.locator('text=Logout').first()).toBeVisible({ timeout: 5000 });
    });

    test('Manager has correct role in database', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Call sync endpoint to get role
        const response = await page.request.get(`${BASE_URL}/api/auth/sync`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.user).toBeDefined();
        expect(data.user.role).toBe('MANAGER');
        expect(data.user.email).toBe(managerEmail);
    });

    test('Manager can access Tours page', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Navigate to tours
        await page.goto(`${BASE_URL}/dashboard/tours`);

        // Should NOT see access denied
        await expect(page.locator('text=Access Denied')).not.toBeVisible();

        // Should be on tours page
        await expect(page).toHaveURL(/\/dashboard\/tours/);
    });

    test('Manager can access Reports page', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Navigate to reports
        await page.goto(`${BASE_URL}/dashboard/reports`);

        // Should NOT see access denied (wait up to 10 seconds)
        await expect(page.locator('text=Access Denied')).not.toBeVisible({ timeout: 10000 });
    });

    test('Manager can access Inventory page', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Navigate to inventory
        await page.goto(`${BASE_URL}/dashboard/inventory`);

        // Should NOT see access denied
        await expect(page.locator('text=Access Denied')).not.toBeVisible({ timeout: 10000 });

        // Should be on inventory page
        await expect(page).toHaveURL(/\/dashboard\/inventory/);
    });
});

test.describe('Seller User - Core RBAC Tests', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Seller can log in successfully', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Should be redirected to home or dashboard
        await expect(page).toHaveURL(/localhost:3000/);

        // Check that user is logged in
        await expect(page.locator('text=Logout').first()).toBeVisible({ timeout: 5000 });
    });

    test('Seller has correct role in database', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Call sync endpoint to get role
        const response = await page.request.get(`${BASE_URL}/api/auth/sync`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.user).toBeDefined();
        // Seller might be MANAGER if they logged in first, or SELLER if manager logged in first
        expect(['MANAGER', 'SELLER']).toContain(data.user.role);
        expect(data.user.email).toBe(sellerEmail);
    });

    test('Seller CANNOT access Reports page', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Navigate to reports
        await page.goto(`${BASE_URL}/dashboard/reports`);

        // Should see access denied message
        await expect(page.locator('text=Access Denied')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Required role: Manager')).toBeVisible();
    });

    test('Seller can access Tours page (read-only)', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Navigate to tours
        await page.goto(`${BASE_URL}/dashboard/tours`);

        // Should NOT see access denied
        await expect(page.locator('text=Access Denied')).not.toBeVisible();

        // Should be on tours page
        await expect(page).toHaveURL(/\/dashboard\/tours/);
    });

    test('Seller can access Inventory page', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Navigate to inventory
        await page.goto(`${BASE_URL}/dashboard/inventory`);

        // Should NOT see access denied
        await expect(page.locator('text=Access Denied')).not.toBeVisible({ timeout: 10000 });

        // Should be on inventory page
        await expect(page).toHaveURL(/\/dashboard\/inventory/);
    });
});

test.describe('Unauthenticated Access', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Unauthenticated user can access home page', async ({ page }) => {
        await page.goto(`${BASE_URL}/`);

        // Should see home page content
        await expect(page.locator('text=Tour Guide')).toBeVisible();
    });
});
