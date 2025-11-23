import { test } from '@playwright/test';
import fs from 'fs';

const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

test('Debug Auth', async ({ page }) => {
    console.log(`Navigating to ${BASE_URL}/api/auth/login`);
    await page.goto(`${BASE_URL}/api/auth/login`);

    // Wait a bit
    await page.waitForTimeout(5000);

    const url = page.url();
    console.log(`Current URL: ${url}`);

    const content = await page.content();
    fs.writeFileSync('debug-auth.html', content);
    fs.writeFileSync('debug-url.txt', url);
});
