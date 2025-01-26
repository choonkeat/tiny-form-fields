import { test, expect } from '@playwright/test';

test.describe('responsive layout tests', () => {
	test('desktop view layout has correct structure and scrolling behavior', async ({ page }) => {
		// Set a desktop viewport
		await page.setViewportSize({ width: 2048, height: 800 });
		await page.goto('http://localhost:8000/');

		// Verify the three panels exist
		await expect(page.locator('.tff-left-panel')).toBeVisible();
		await expect(page.locator('.tff-center-panel')).toBeVisible();
		await expect(page.locator('.tff-right-panel')).toHaveCount(1);

		// Initial height of the layout
		const initialHeight = await page.evaluate(() => document.documentElement.scrollHeight);

		// Add multiple questions to create scrollable content
		for (let i = 0; i < 10; i++) {
			await page.getByRole('button', { name: 'Single-line free text' }).click();
			await page.waitForTimeout(100);
		}

		// Verify center panel is scrollable
		const centerPanel = page.locator('.tff-center-panel');
		const hasVerticalScrollbar = await centerPanel.evaluate((el) => {
			return el.scrollHeight > el.clientHeight;
		});
		expect(hasVerticalScrollbar).toBeTruthy();

		// Verify overall layout height hasn't increased
		const finalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
		expect(finalHeight).toBe(initialHeight);

		// Verify right panel appears when clicking a form field
		await page.locator('.tff-field-container .tff-drag-handle-icon').first().click();
		await expect(page.locator(".tff-panel-visible:has-text('Field Settings')")).toBeVisible();
	});

	test('2 column layout has correct structure and panel switching behavior', async ({ page }) => {
		// Set a md viewport
		await page.setViewportSize({ width: 1024, height: 800 });
		await page.goto('http://localhost:8000/');

		// Verify initial mobile layout - center panel on top, add questions at bottom
		await expect(page.locator('.tff-center-panel')).toBeVisible();
		await expect(page.locator('.tff-left-panel')).toBeVisible();
		await expect(page.locator('.tff-right-panel')).toBeVisible();
		await expect(page.locator(".tff-panel-visible:has-text('Field Settings')")).toBeHidden();

		// Add multiple questions and verify center panel grows in height
		const initialCenterPanelHeight = await page
			.locator('.tff-center-panel')
			.evaluate((el) => el.clientHeight);

		for (let i = 0; i < 10; i++) {
			await page.getByRole('button', { name: 'Single-line free text' }).click();
			await page.waitForTimeout(100);
		}

		// Initial height of the layout
		const initialHeight = await page.evaluate(() => document.documentElement.scrollHeight);

		// Verify center panel is scrollable
		const centerPanel = page.locator('.tff-center-panel');
		const hasVerticalScrollbar = await centerPanel.evaluate((el) => {
			return el.scrollHeight > el.clientHeight;
		});
		expect(hasVerticalScrollbar).toBeTruthy();

		// Verify overall layout height hasn't increased
		const finalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
		expect(finalHeight).toBe(initialHeight);

		// Click a field to show Field Settings panel
		await page.locator('.tff-field-container .tff-drag-handle-icon').first().click();
		await expect(page.locator(".tff-panel-visible:has-text('Field Settings')")).toBeVisible();
		await expect(page.locator('.tff-left-panel')).toHaveClass(/tff-panel-hidden/);
		await expect(page.locator('.tff-center-panel')).toHaveClass(/tff-panel-hidden/);

		// Close Field Settings panel and verify other panels reappear
		await page.locator('.tff-close-button').click();
		await expect(page.locator(".tff-panel-visible:has-text('Field Settings')")).toBeHidden();
		await expect(page.locator('.tff-left-panel')).not.toHaveClass(/tff-panel-hidden/);
		await expect(page.locator('.tff-center-panel')).not.toHaveClass(/tff-panel-hidden/);
	});

	test('mobile view layout has correct structure and panel switching behavior', async ({
		page,
	}) => {
		// Set a mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('http://localhost:8000/');

		// Verify initial mobile layout - center panel on top, add questions at bottom
		await expect(page.locator('.tff-center-panel')).toBeVisible();
		await expect(page.locator('.tff-left-panel')).toBeVisible();
		await expect(page.locator('.tff-right-panel')).toBeVisible();
		await expect(page.locator(".tff-panel-visible:has-text('Field Settings')")).toBeHidden();

		// Add multiple questions and verify center panel grows in height
		const initialCenterPanelHeight = await page
			.locator('.tff-center-panel')
			.evaluate((el) => el.clientHeight);

		for (let i = 0; i < 5; i++) {
			await page.getByRole('button', { name: 'Single-line free text' }).click();
			await page.waitForTimeout(100);
		}

		const finalCenterPanelHeight = await page
			.locator('.tff-center-panel')
			.evaluate((el) => el.clientHeight);
		expect(finalCenterPanelHeight).toBeGreaterThan(initialCenterPanelHeight);

		// Verify center panel does not have its own scroll
		const hasVerticalScrollbar = await page.locator('.tff-center-panel').evaluate((el) => {
			return el.scrollHeight > el.clientHeight;
		});
		expect(hasVerticalScrollbar).toBeFalsy();

		// Click a field to show Field Settings panel
		await page.locator('.tff-field-container .tff-drag-handle-icon').first().click();
		await expect(page.locator(".tff-panel-visible:has-text('Field Settings')")).toBeVisible();
		await expect(page.locator('.tff-left-panel')).toHaveClass(/tff-panel-hidden/);
		await expect(page.locator('.tff-center-panel')).toHaveClass(/tff-panel-hidden/);

		// Close Field Settings panel and verify other panels reappear
		await page.locator('.tff-close-button').click();
		await expect(page.locator(".tff-panel-visible:has-text('Field Settings')")).toBeHidden();
		await expect(page.locator('.tff-left-panel')).not.toHaveClass(/tff-panel-hidden/);
		await expect(page.locator('.tff-center-panel')).not.toHaveClass(/tff-panel-hidden/);
	});
});
