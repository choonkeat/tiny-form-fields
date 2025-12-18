import { test, expect } from '@playwright/test';
import { viewForm } from './test-utils';

test('System presence + ChooseMultiple with no minRequired should enforce at least 1 selection', async ({
	page,
}) => {
	await page.goto('');

	// Wait for page to load
	await page.waitForTimeout(500);

	// Create a new ChooseMultiple field
	await page.getByRole('button', { name: 'Checkboxes' }).click();

	// Wait for the field to be created and visible
	await page.waitForSelector('text=Checkboxes question 1');

	// Find the "Minimum required" input - it should be empty/0 by default
	const minRequiredInput = page.locator('input[type="number"]').first();

	// Verify it's empty or 0
	const minValue = await minRequiredInput.inputValue();
	expect(minValue).toBe('');

	// Now switch to CollectData mode to test the form
	await page.getByRole('button', { name: 'Preview' }).click();

	// Verify we're in CollectData mode
	await expect(page.locator('.tff-root')).toBeVisible();

	// Try to find checkboxes
	const checkboxes = page.locator('input[type="checkbox"]');
	const checkboxCount = await checkboxes.count();

	// Should have some checkboxes (default choices)
	expect(checkboxCount).toBeGreaterThan(0);

	// Try to submit the form without selecting anything
	// For a ChooseMultiple field with System presence, this should be blocked
	// But currently (before fix), there's no validation element so it's not blocked

	// Check if there's a hidden validation input
	const validationInput = page.locator('input[type="number"].tff-visually-hidden');

	// Before fix: validation element won't exist for fields without explicit minRequired
	// After fix: validation element should exist for System presence fields
	const validationExists = await validationInput.count();

	// This test currently expects the fix to be in place
	// The validation input should exist and have min="1" for System fields
	if (validationExists > 0) {
		const minAttr = await validationInput.getAttribute('min');
		expect(minAttr).toBe('1');
	} else {
		// Fail the test - validation element should exist for System presence
		throw new Error(
			'Expected validation element to exist for System + ChooseMultiple field, but it does not'
		);
	}
});

test('System presence + ChooseMultiple validation in action', async ({ page }) => {
	await page.goto('');

	// Wait for page to load
	await page.waitForTimeout(500);

	// We need to programmatically create a field with System presence
	// since the UI doesn't allow creating System fields directly
	// This will be done by injecting JSON

	const systemChooseMultipleJSON = JSON.stringify([
		{
			label: 'System Field Test',
			name: '_test_system',
			presence: 'System',
			type: {
				type: 'ChooseMultiple',
				choices: ['Option 1', 'Option 2', 'Option 3'],
				// Note: minRequired is intentionally omitted (will be undefined/null)
			},
		},
	]);

	// Inject the form fields via the port
	await page.evaluate((json) => {
		const parsed = JSON.parse(json);
		// @ts-ignore
		window.elmApp.ports.incoming.send({
			type: 'formFields',
			formFields: parsed,
		});
	}, systemChooseMultipleJSON);

	// Wait a bit for the form to update
	await page.waitForTimeout(500);

	// Switch to Preview mode
	await page.getByRole('button', { name: 'Preview' }).click();

	// Verify the field is present
	await expect(page.locator('text=System Field Test')).toBeVisible();

	// Check for validation element
	const validationInput = page.locator('input[type="number"].tff-visually-hidden');
	await expect(validationInput).toHaveCount(1);

	// Verify it has min="1"
	await expect(validationInput).toHaveAttribute('min', '1');

	// Verify it's required
	await expect(validationInput).toHaveAttribute('required');

	// Verify its value is 0 (no selections yet)
	await expect(validationInput).toHaveAttribute('value', '0');
});
