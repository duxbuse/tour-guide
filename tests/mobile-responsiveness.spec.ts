import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
    // Only run these tests on mobile viewports
    test.skip(({ isMobile }) => !isMobile, 'This test suite is for mobile viewports only');

    test.beforeEach(async ({ page }) => {
        // Login logic (mocked or real depending on setup, assuming we can bypass or use a test user)
        // For now, we'll assume we can navigate to the inventory page directly if auth is mocked or handled globally
        // If auth is needed, we might need to implement a login helper
        await page.goto('/dashboard/inventory');
    });

    test('Inventory page should not have horizontal scroll', async ({ page }) => {
        const viewportWidth = page.viewportSize()?.width || 0;

        // Check if the body width is equal to viewport width
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);

        // Allow a small buffer for scrollbars if present, but generally should be close
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });

    test('Text should be readable on mobile', async ({ page }) => {
        // Check font sizes of key elements
        const bodyFontSize = await page.locator('body').evaluate((el) => {
            return window.getComputedStyle(el).fontSize;
        });

        // Parse '16px' to 16
        const size = parseFloat(bodyFontSize);
        expect(size).toBeGreaterThanOrEqual(14);
    });

    test('Header actions should wrap or be accessible', async ({ page }) => {
        // Check if the "New Item" button is visible
        const newItemBtn = page.getByRole('button', { name: 'New Item' });
        await expect(newItemBtn).toBeVisible();

        // Check if "Export Excel" is visible (it might be hidden on very small screens if we decide to hide it, but for now it should be there)
        // Or check if it stacks correctly
        const exportBtn = page.getByRole('button', { name: 'Export Excel' });
        if (await exportBtn.count() > 0) {
            await expect(exportBtn).toBeVisible();
        }
    });

    test('Modals should fit within viewport', async ({ page }) => {
        // Open New Item Modal
        await page.getByRole('button', { name: 'New Item' }).click();

        const modal = page.locator('.modal');
        await expect(modal).toBeVisible();

        // Check modal width
        const modalBox = await modal.boundingBox();
        const viewportWidth = page.viewportSize()?.width || 0;

        if (modalBox) {
            expect(modalBox.width).toBeLessThanOrEqual(viewportWidth);
            // Ensure some margin
            expect(modalBox.width).toBeLessThan(viewportWidth);
        }

        // Close modal
        await page.locator('.close-btn').click();
    });

    test('Inventory stats should be stacked or scrollable', async ({ page }) => {
        const statsContainer = page.locator('.inventory-stats');
        await expect(statsContainer).toBeVisible();

        // Check layout - on mobile they should likely wrap
        const display = await statsContainer.evaluate((el) => window.getComputedStyle(el).display);
        const flexWrap = await statsContainer.evaluate((el) => window.getComputedStyle(el).flexWrap);

        if (display === 'flex') {
            expect(flexWrap).toBe('wrap');
        }
    });
});
