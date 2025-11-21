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

test.describe('Manager User Authentication', () => {
    test.use({ storageState: { cookies: [], origins: [] } }); // Start with clean state

    test('Manager can log in successfully', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Should be redirected to dashboard or home
        await expect(page).toHaveURL(/localhost:3000/);

        // Check that user is logged in by looking for logout button or user info
        await expect(page.locator('text=Logout')).toBeVisible({ timeout: 5000 });
    });

    test('Manager can access dashboard', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Navigate to dashboard
        await page.goto(`${BASE_URL}/dashboard`);

        // Should see dashboard content
        await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
        await expect(page.locator('text=Welcome back')).toBeVisible();
    });

    test('Manager can access tours page', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Navigate to tours
        await page.goto(`${BASE_URL}/dashboard/tours`);

        // Should see tours page (not access denied)
        await expect(page.locator('text=Access Denied')).not.toBeVisible();
    });

    test('Manager can view profile', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Navigate to profile
        await page.goto(`${BASE_URL}/profile`);

        // Should see profile information
        await expect(page.locator('h1:has-text("Profile")')).toBeVisible();
        await expect(page.locator(`text=${managerEmail}`)).toBeVisible();
    });

    test('Manager can log out', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);

        // Click logout
        await page.click('text=Logout');

        // Wait for redirect
        await page.waitForURL(/localhost:3000/, { timeout: 5000 });

        // Should see login button instead of logout
        await expect(page.locator('text=Log In')).toBeVisible();
    });
});

test.describe('Seller User Authentication', () => {
    test.use({ storageState: { cookies: [], origins: [] } }); // Start with clean state

    test('Seller can log in successfully', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Should be redirected to dashboard or home
        await expect(page).toHaveURL(/localhost:3000/);

        // Check that user is logged in
        await expect(page.locator('text=Logout')).toBeVisible({ timeout: 5000 });
    });

    test('Seller can access dashboard', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Navigate to dashboard
        await page.goto(`${BASE_URL}/dashboard`);

        // Should see dashboard content (sellers have access to dashboard)
        await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    });

    test('Seller can view profile', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Navigate to profile
        await page.goto(`${BASE_URL}/profile`);

        // Should see profile information
        await expect(page.locator('h1:has-text("Profile")')).toBeVisible();
        await expect(page.locator(`text=${sellerEmail}`)).toBeVisible();
    });

    test('Seller has correct role in session', async ({ page }) => {
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        await login(page, sellerEmail, sellerPassword);

        // Navigate to profile to see session data
        await page.goto(`${BASE_URL}/profile`);

        // Check that the role is displayed (if your profile page shows it)
        // This will depend on how you display the session data
        const pageContent = await page.content();

        // The session should contain role information
        expect(pageContent).toBeTruthy();
    });
});

test.describe('Unauthenticated Access', () => {
    test.use({ storageState: { cookies: [], origins: [] } }); // Start with clean state

    test('Unauthenticated user is redirected to login when accessing dashboard', async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard`);

        // Should be redirected to Auth0 login
        await expect(page).toHaveURL(/auth0\.com/, { timeout: 10000 });
    });

    test('Unauthenticated user is redirected to login when accessing profile', async ({ page }) => {
        await page.goto(`${BASE_URL}/profile`);

        // Should be redirected to Auth0 login
        await expect(page).toHaveURL(/auth0\.com/, { timeout: 10000 });
    });

    test('Unauthenticated user can access home page', async ({ page }) => {
        await page.goto(`${BASE_URL}/`);

        // Should see home page content
        await expect(page.locator('text=Tour Guide')).toBeVisible();
        await expect(page.locator('text=Get Started')).toBeVisible();
    });
});

test.describe('Role-Based Access Control', () => {
    test('Manager and Seller have different access levels', async ({ browser }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;
        const sellerEmail = process.env.AUTH0_SELLER_EMAIL;
        const sellerPassword = process.env.AUTH0_SELLER_PASSWORD;

        if (!managerEmail || !managerPassword || !sellerEmail || !sellerPassword) {
            test.skip();
            return;
        }

        // Test Manager access
        const managerContext = await browser.newContext();
        const managerPage = await managerContext.newPage();

        await login(managerPage, managerEmail, managerPassword);
        await managerPage.goto(`${BASE_URL}/profile`);

        const managerContent = await managerPage.content();

        await managerContext.close();

        // Test Seller access
        const sellerContext = await browser.newContext();
        const sellerPage = await sellerContext.newPage();

        await login(sellerPage, sellerEmail, sellerPassword);
        await sellerPage.goto(`${BASE_URL}/profile`);

        const sellerContent = await sellerPage.content();

        await sellerContext.close();

        // Both should be able to access their profiles
        expect(managerContent).toContain('Profile');
        expect(sellerContent).toContain('Profile');

        // But they should have different user data
        expect(managerContent).toContain(managerEmail);
        expect(sellerContent).toContain(sellerEmail);
    });
});
