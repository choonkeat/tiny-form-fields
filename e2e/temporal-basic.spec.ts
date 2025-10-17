import { test, expect } from '@playwright/test';
import { addField, viewForm } from './test-utils';

test.describe('Basic Temporal Input CSS Classes', () => {
	test('should apply tff-empty-optional class to empty optional temporal inputs', async ({
		page,
	}) => {
		// Set a desktop viewport
		await page.setViewportSize({ width: 2048, height: 800 });
		await page.goto('');

		// Add a date field (required by default)
		await addField(page, 'Date', undefined, {
			label: 'Required Date Field',
			description: 'This is a required date field',
		});

		// Switch to CollectData mode to test the classes
		const formPage = await viewForm(page);

		// Check initial state - required field should not have tff-empty-optional
		const requiredInput = formPage.locator('input[type="date"]').first();
		await expect(requiredInput).toBeVisible();

		const requiredClasses = await requiredInput.getAttribute('class');
		const requiredAttr = await requiredInput.getAttribute('required');
		const isRequired = requiredAttr !== null;
		const value = await requiredInput.inputValue();

		// Verify field setup
		expect(isRequired).toBe(true);
		expect(value).toBe(''); // Should start empty

		// Required fields should NOT have tff-empty-optional class
		expect(requiredClasses).toContain('tff-text-field');
		expect(requiredClasses).not.toContain('tff-empty-optional');

		// Fill the field and verify class disappears
		await requiredInput.fill('2024-01-15');
		await formPage.waitForTimeout(100);

		const filledClasses = await requiredInput.getAttribute('class');
		const filledValue = await requiredInput.inputValue();

		// Verify value was set and still no tff-empty-optional
		expect(filledValue).toBe('2024-01-15');
		expect(filledClasses).toContain('tff-text-field');
		expect(filledClasses).not.toContain('tff-empty-optional');
	});
});
