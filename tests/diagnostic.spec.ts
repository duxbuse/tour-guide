import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

test('Diagnostic: Check if Auth0 login page loads', async ({ page }) => {
    console.log('Manager Email:', process.env.AUTH0_MANAGER_EMAIL);
    console.log('Manager Password exists:', !!process.env.AUTH0_MANAGER_PASSWORD);
    console.log('Base URL:', BASE_URL);

    // Try to navigate to login
    console.log('Navigating to login...');
    await page.goto(`${BASE_URL}/api/auth/login`, { timeout: 15000 });

    // Wait a bit to see what happens
    await page.waitForTimeout(3000);

    const url = page.url();
    console.log('Current URL:', url);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/diagnostic-login.png', fullPage: true });

    // Check if we're on Auth0
    const isAuth0 = url.includes('auth0.com');
    console.log('Is on Auth0:', isAuth0);

    if (isAuth0) {
        // Try to find the login form
        const usernameInput = page.locator('input[name="username"]');
        const passwordInput = page.locator('input[name="password"]');

        console.log('Username input visible:', await usernameInput.isVisible().catch(() => false));
        console.log('Password input visible:', await passwordInput.isVisible().catch(() => false));
    }

    expect(url).toBeTruthy();
});
