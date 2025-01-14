// tests/visibility.spec.ts
import { test, expect } from '@playwright/test';
import { addField, FieldEdit } from './test-utils';

test('visibility rules in preview mode', async ({ page }) => {
    await page.goto("http://localhost:8000/");

    await addField(page, 'Radio buttons', [{ label: 'Radio buttons question title', value: 'Do you agree?' }]);
    await addField(page, 'Single-line free text', [{ label: 'Single-line free text question title', value: 'Why so?' }]);
    await addField(page, 'Single-line free text', [{ label: 'Single-line free text question title', value: 'Why not?' }]);

    // Switch to preview mode
    const page1Promise = page.waitForEvent("popup");
    await page
        .getByRole("link", { name: "View sample Collect Data page" })
        .click();
    const page1 = await page1Promise;

    // Test Yes selection
    await page1.click('input[value="Yes"]');
    await expect(page1.locator('text="Why so?"')).toBeVisible();
    await expect(page1.locator('text="Why not?"')).toHaveCount(0);

    // Test No selection  
    await page1.click('input[value="No"]');
    await expect(page1.locator('text="Why so?"')).toHaveCount(0);
    await expect(page1.locator('text="Why not?"')).toBeVisible();
});