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

async function ensureTourExists(page: import('@playwright/test').Page) {
    await page.goto(`${BASE_URL}/dashboard/tours`);

    // Check if there are tours by looking for the empty state
    const emptyState = page.locator('h3:has-text("No tours yet")');

    if (await emptyState.isVisible()) {
        const createTourBtn = page.locator('button:has-text("Create Tour"), button:has-text("+ New Tour")').first();
        await createTourBtn.click();
        await page.fill('input[placeholder="e.g. Summer Tour 2024"]', `Test Tour ${Date.now()}`);
        await page.click('button:has-text("Create Tour")');
        // Wait for the modal to close and tour to appear
        await page.waitForSelector('.card', { timeout: 10000 });
    }
}

test.describe('Inventory Management', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Manager can navigate to inventory', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);
        await ensureTourExists(page);
        await page.goto(`${BASE_URL}/dashboard/inventory`);

        await expect(page.locator('h1:has-text("Inventory")')).toBeVisible();
    });

    test('Manager can add a new merch item', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);
        await ensureTourExists(page);
        await page.goto(`${BASE_URL}/dashboard/inventory`);

        // Check if there are tours, if not we can't add items
        const newItemBtn = page.locator('button:has-text("New Item"), button:has-text("Add Item")').first();

        await expect(newItemBtn).toBeVisible();
        await expect(newItemBtn).toBeEnabled();

        await newItemBtn.click();

        const itemName = `Test Item ${Date.now()}`;
        await page.fill('input[placeholder="e.g. Tour T-Shirt"]', itemName);

        // Select Category (use specific locator as there are multiple selects)
        await page.locator('.form-group:has-text("Category") select').selectOption({ label: 'APPAREL' });

        await page.fill('textarea', 'Test Description');
        await page.fill('input[placeholder="0.00"]', '25.00');

        // Variants
        await page.fill('input[placeholder="Type (e.g. Mens)"]', 'Unisex');
        await page.fill('input[placeholder="Qty"]', '100');

        await page.click('button:has-text("Create Item")');

        // Verify item appears
        await expect(page.locator(`text=${itemName}`)).toBeVisible();
    });

    test('Manager can delete a merch item', async ({ page }) => {
        const managerEmail = process.env.AUTH0_MANAGER_EMAIL;
        const managerPassword = process.env.AUTH0_MANAGER_PASSWORD;

        if (!managerEmail || !managerPassword) {
            test.skip();
            return;
        }

        await login(page, managerEmail, managerPassword);
        await ensureTourExists(page);
        await page.goto(`${BASE_URL}/dashboard/inventory`);

        // Create a specific one to delete to be safe
        const newItemBtn = page.locator('button:has-text("New Item"), button:has-text("Add Item")').first();

        await expect(newItemBtn).toBeVisible();
        await expect(newItemBtn).toBeEnabled();

        await newItemBtn.click();
        const itemName = `Delete Me ${Date.now()}`;
        await page.fill('input[placeholder="e.g. Tour T-Shirt"]', itemName);
        await page.fill('input[placeholder="0.00"]', '10.00');
        await page.fill('input[placeholder="Qty"]', '10');
        await page.click('button:has-text("Create Item")');
        await expect(page.locator(`text=${itemName}`)).toBeVisible();

        // Now delete it
        page.on('dialog', dialog => dialog.accept()); // Handle confirm dialog

        // Find the card with this item name
        const card = page.locator('.merch-card', { hasText: itemName });
        await card.locator('button:has-text("Delete")').click();

        await expect(page.locator(`text=${itemName}`)).not.toBeVisible();
    });
});
