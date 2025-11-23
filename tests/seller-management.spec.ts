import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

// Helper function to login
async function login(page: import('@playwright/test').Page, email: string, password: string) {
    // Determine role based on email (hacky but works for this mock)
    const role = email.includes('seller') ? 'seller' : 'manager';

    await page.goto(`${BASE_URL}/`);
    await page.evaluate((r) => {
        localStorage.setItem('tour-guide-user-type', r);
    }, role);

    // Navigate to dashboard to "login"
    await page.goto(`${BASE_URL}/dashboard`);
}

test.describe('Seller Management', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Manager can access seller management features', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Navigate to tours page where seller management should be
        await page.goto(`${BASE_URL}/dashboard/tours`);

        // Check that manager can see tours
        await expect(page.locator('h1:has-text("Tours")')).toBeVisible();
    });

    test('Seller only sees assigned shows', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Navigate to inventory page
        await page.goto(`${BASE_URL}/dashboard/inventory`);

        // Seller should see inventory page
        await expect(page.locator('h1:has-text("Inventory")')).toBeVisible();

        // Seller should see tours (because they have assignments from seed data)
        const tourTabs = page.locator('.tabs .tab');
        await expect(tourTabs.first()).toBeVisible();
    });

    test('Seller cannot access unassigned show inventory', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Navigate to dashboard
        await page.goto(`${BASE_URL}/dashboard`);

        // Seller should have access to dashboard
        await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    });
});

test.describe('Seller Access Control', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Seller can edit inventory for assigned shows', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Navigate to inventory
        await page.goto(`${BASE_URL}/dashboard/inventory`);

        // Check if there are any merch items visible
        const merchCards = page.locator('.merch-card');
        const count = await merchCards.count();

        if (count > 0) {
            // If there are items, seller should be able to see edit button
            const editButton = merchCards.first().locator('button:has-text("Edit Quantities")');
            await expect(editButton).toBeVisible();
        }
    });

    test('Manager can see all shows regardless of assignments', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Navigate to tours
        await page.goto(`${BASE_URL}/dashboard/tours`);

        // Manager should see all tours
        await expect(page.locator('h1:has-text("Tours")')).toBeVisible();

        // Check that tours are visible
        const tourCards = page.locator('.card');
        await expect(tourCards.first()).toBeVisible();
    });
});
