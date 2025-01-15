// tests/visibility.spec.ts
import { test, expect } from '@playwright/test';
import { addField } from './test-utils';

test('[Dropdown] visibility rules in preview mode', async ({ page }) => {
    await page.goto("http://localhost:8000/");

    // Add radio button field first since other fields will reference it
    await addField(page, 'Dropdown', [{ label: 'Dropdown question title', value: 'Logic question' }]);

    // Add "Why Red?" text field that shows when "Red" is selected
    await addField(page, 'Single-line free text', [{
        label: 'Single-line free text question title',
        value: 'Why Red?',
        visibilityRule: {
            type: 'Show when',
            field: 'Logic question',
            comparison: {
                type: 'equals',
                value: 'Red'
            }
        }
    }]);

    // Add "Why Orange?" text field that shows when "Orange" is selected
    await addField(page, 'Single-line free text', [{
        label: 'Single-line free text question title',
        value: 'Why Orange?',
        visibilityRule: {
            type: 'Show when',
            field: 'Logic question',
            comparison: {
                type: 'equals',
                value: 'Orange'
            }
        }
    }]);

    // Switch to preview mode
    const page1Promise = page.waitForEvent("popup");
    await page
        .getByRole("link", { name: "View sample Collect Data page" })
        .click();
    const page1 = await page1Promise;

    // Test Red selection
    await page1.getByRole('combobox').selectOption('Red');
    await expect(page1.locator('text="Why Red?"')).toBeVisible();
    await expect(page1.locator('text="Why Orange?"')).toHaveCount(0);

    // Test Orange selection  
    await page1.getByRole('combobox').selectOption('Orange');
    await expect(page1.locator('text="Why Red?"')).toHaveCount(0);
    await expect(page1.locator('text="Why Orange?"')).toBeVisible();
});

test('[Radio buttons] visibility rules in preview mode', async ({ page }) => {
    await page.goto("http://localhost:8000/");

    // Add radio button field first since other fields will reference it
    await addField(page, 'Radio buttons', [{ label: 'Radio buttons question title', value: 'Logic question' }]);

    // Add "Why Yes?" text field that shows when "Yes" is selected
    await addField(page, 'Single-line free text', [{
        label: 'Single-line free text question title',
        value: 'Why Yes?',
        visibilityRule: {
            type: 'Show when',
            field: 'Logic question',
            comparison: {
                type: 'equals',
                value: 'Yes'
            }
        }
    }]);

    // Add "Why No?" text field that shows when "No" is selected
    await addField(page, 'Single-line free text', [{
        label: 'Single-line free text question title',
        value: 'Why No?',
        visibilityRule: {
            type: 'Show when',
            field: 'Logic question',
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
    await expect(page1.locator('text="Why Yes?"')).toBeVisible();
    await expect(page1.locator('text="Why No?"')).toHaveCount(0);

    // Test No selection  
    await page1.click('input[value="No"]');
    await expect(page1.locator('text="Why Yes?"')).toHaveCount(0);
    await expect(page1.locator('text="Why No?"')).toBeVisible();
});

test('[Checkboxes] visibility rules in preview mode', async ({ page }) => {
    await page.goto("http://localhost:8000/");

    // Add checkbox field first since other fields will reference it
    await addField(page, 'Checkboxes', [{ label: 'Checkboxes question title', value: 'Logic question' }]);

    // Add "Why Apple?" text field that shows when "Apple" is selected
    await addField(page, 'Single-line free text', [{
        label: 'Single-line free text question title',
        value: 'Why Apple?',
        visibilityRule: {
            type: 'Show when',
            field: 'Logic question',
            comparison: {
                type: 'choice includes',
                value: 'Apple'
            }
        }
    }]);

    // Add "Why Banana?" text field that shows when "Banana" is selected
    await addField(page, 'Single-line free text', [{
        label: 'Single-line free text question title',
        value: 'Why Banana?',
        visibilityRule: {
            type: 'Show when',
            field: 'Logic question',
            comparison: {
                type: 'choice includes',
                value: 'Banana'
            }
        }
    }]);

    // Switch to preview mode
    const page1Promise = page.waitForEvent("popup");
    await page
        .getByRole("link", { name: "View sample Collect Data page" })
        .click();
    const page1 = await page1Promise;

    // Test Apple selection
    await page1.click('input[value="Apple"]');
    await expect(page1.locator('text="Why Apple?"')).toBeVisible();
    await expect(page1.locator('text="Why Banana?"')).toHaveCount(0);

    // Test Banana selection  
    await page1.click('input[value="Banana"]');
    await expect(page1.locator('text="Why Apple?"')).toBeVisible(); // Both should be visible since checkboxes allow multiple selections
    await expect(page1.locator('text="Why Banana?"')).toBeVisible();

    // Uncheck Apple
    await page1.click('input[value="Apple"]');
    await expect(page1.locator('text="Why Apple?"')).toHaveCount(0);
    await expect(page1.locator('text="Why Banana?"')).toBeVisible();
});

test('[Multi-line description] visibility rules with contains in preview mode', async ({ page }) => {
    await page.goto("http://localhost:8000/");

    // Add multi-line description field first since other fields will reference it
    await addField(page, 'Multi-line description', [{ label: 'Multi-line description question title', value: 'Logic question' }]);

    // Add "Contains urgent" text field that shows when text contains "urgent"
    await addField(page, 'Single-line free text', [{
        label: 'Single-line free text question title',
        value: 'Contains urgent',
        visibilityRule: {
            type: 'Show when',
            field: 'Logic question',
            comparison: {
                type: 'contains',
                value: 'urgent'
            }
        }
    }]);

    // Add "Contains important" text field that shows when text contains "important"
    await addField(page, 'Single-line free text', [{
        label: 'Single-line free text question title',
        value: 'Contains important',
        visibilityRule: {
            type: 'Show when',
            field: 'Logic question',
            comparison: {
                type: 'contains',
                value: 'important'
            }
        }
    }]);

    // Switch to preview mode
    const page1Promise = page.waitForEvent("popup");
    await page
        .getByRole("link", { name: "View sample Collect Data page" })
        .click();
    const page1 = await page1Promise;

    // Test text with no matches
    await page1.fill('textarea', 'This is a regular message');
    await expect(page1.locator('text="Contains urgent"')).toHaveCount(0);
    await expect(page1.locator('text="Contains important"')).toHaveCount(0);

    // Test text containing "urgent"
    await page1.fill('textarea', 'This is an urgent message');
    await expect(page1.locator('text="Contains urgent"')).toBeVisible();
    await expect(page1.locator('text="Contains important"')).toHaveCount(0);

    // Test text containing both "urgent" and "important"
    await page1.fill('textarea', 'This is an urgent and important message');
    await expect(page1.locator('text="Contains urgent"')).toBeVisible();
    await expect(page1.locator('text="Contains important"')).toBeVisible();

    // Test text containing only "important"
    await page1.fill('textarea', 'This is an important message');
    await expect(page1.locator('text="Contains urgent"')).toHaveCount(0);
    await expect(page1.locator('text="Contains important"')).toBeVisible();
});

test('[Single-line free text] visibility rules with contains in preview mode', async ({ page }) => {
    await page.goto("http://localhost:8000/");

    // Add single-line free text field first since other fields will reference it
    await addField(page, 'Single-line free text', [{ label: 'Single-line free text question title', value: 'Logic question' }]);

    // Add "Contains urgent" text field that shows when text contains "urgent"
    await addField(page, 'Single-line free text', [{
        label: 'Single-line free text question title',
        value: 'Contains urgent',
        visibilityRule: {
            type: 'Show when',
            field: 'Logic question',
            comparison: {
                type: 'contains',
                value: 'urgent'
            }
        }
    }]);

    // Add "Contains important" text field that shows when text contains "important"
    await addField(page, 'Single-line free text', [{
        label: 'Single-line free text question title',
        value: 'Contains important',
        visibilityRule: {
            type: 'Show when',
            field: 'Logic question',
            comparison: {
                type: 'contains',
                value: 'important'
            }
        }
    }]);

    // Switch to preview mode
    const page1Promise = page.waitForEvent("popup");
    await page
        .getByRole("link", { name: "View sample Collect Data page" })
        .click();
    const page1 = await page1Promise;

    // Test text with no matches
    await page1.fill("input[name='Logic question']", 'This is a regular message');
    await expect(page1.locator('text="Contains urgent"')).toHaveCount(0);
    await expect(page1.locator('text="Contains important"')).toHaveCount(0);

    // Test text containing "urgent"
    await page1.fill("input[name='Logic question']", 'This is an urgent message');
    await expect(page1.locator('text="Contains urgent"')).toBeVisible();
    await expect(page1.locator('text="Contains important"')).toHaveCount(0);

    // Test text containing both "urgent" and "important"
    await page1.fill("input[name='Logic question']", 'This is an urgent and important message');
    await expect(page1.locator('text="Contains urgent"')).toBeVisible();
    await expect(page1.locator('text="Contains important"')).toBeVisible();

    // Test text containing only "important"
    await page1.fill("input[name='Logic question']", 'This is an important message');
    await expect(page1.locator('text="Contains urgent"')).toHaveCount(0);
    await expect(page1.locator('text="Contains important"')).toBeVisible();
});
