// tests/visibility.spec.ts
import { test, expect } from '@playwright/test';
import { addField, FieldEdit } from './test-utils';

test('visibility rules in preview mode', async ({ page }) => {
    await page.goto("http://localhost:8000/");

    // Add radio button field first since other fields will reference it
    await addField(page, 'Radio buttons', [{ label: 'Radio buttons question title', value: 'Do you agree?' }]);

    // Add "Why so?" text field that shows when "Yes" is selected
    await addField(page, 'Single-line free text', [{
        label: 'Single-line free text question title',
        value: 'Why so?',
        visibilityRule: {
            type: 'Show when',
            field: 'Do you agree?',
            comparison: {
                type: 'equals',
                value: 'Yes'
            }
        }
    }]);

    // Add "Why not?" text field that shows when "No" is selected
    await addField(page, 'Single-line free text', [{
        label: 'Single-line free text question title',
        value: 'Why not?',
        visibilityRule: {
            type: 'Show when',
            field: 'Do you agree?',
            comparison: {
                type: 'equals',
                value: 'No'
            }
        }
    }]);

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