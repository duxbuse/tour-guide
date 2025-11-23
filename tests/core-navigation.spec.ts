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

test.describe('Core Navigation', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('User can navigate to Reports', async ({ page, isMobile }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Navigate via menu
        if (isMobile) {
            await page.click('button[aria-label="Toggle menu"]');
            await page.click('a[href="/dashboard/reports"].mobile-nav-link');
        } else {
            await page.click('a[href="/dashboard/reports"].nav-link');
        }

        await expect(page).toHaveURL(/\/dashboard\/reports/);
        await expect(page.locator('h1')).toContainText('Reports');
    });

    test('User can navigate to Tours', async ({ page, isMobile }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Navigate via menu
        if (isMobile) {
            await page.click('button[aria-label="Toggle menu"]');
            await page.click('a[href="/dashboard/tours"].mobile-nav-link');
        } else {
            await page.click('a[href="/dashboard/tours"].nav-link');
        }

        await expect(page).toHaveURL(/\/dashboard\/tours/);
        await expect(page.locator('h1')).toContainText('Tours');
    });
});
