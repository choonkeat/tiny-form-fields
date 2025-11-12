// Test to verify that field values persist when hidden and then unhidden
// This test currently FAILS because sanitizeFormValues deletes hidden field values
import { test, expect } from '@playwright/test';
import { addField } from './test-utils';

test('Field value should persist when hidden and then unhidden', async ({ page }) => {
	await page.goto('');

	// Field A: Toggle to show/hide Field B
	await addField(page, 'Radio buttons', [
		{ label: 'Radio buttons question title', value: 'Show details?' },
	]);

	// Field B: Text field that is conditionally shown
	await addField(page, 'Single-line free text', [
		{
			label: 'Single-line free text question title',
			value: 'Your details',
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Show details?',
					comparison: [
						{
							type: 'Equals',
							value: 'Yes',
						},
					],
				},
			],
		},
	]);

	// Switch to preview mode
	const page1Promise = page.waitForEvent('popup');
	await page.getByRole('link', { name: 'View form' }).click();
	const page1 = await page1Promise;

	// Step 1: Show Field B
	await page1.getByRole('radio', { name: 'Yes' }).first().click();
	await expect(page1.locator('text="Your details"')).toBeVisible();

	// Step 2: Enter a value in Field B
	const testValue = 'Important information';
	await page1.getByLabel('Your details').fill(testValue);

	// Verify the value was entered
	await expect(page1.getByLabel('Your details')).toHaveValue(testValue);

	// Step 3: Hide Field B
	await page1.getByRole('radio', { name: 'No' }).first().click();
	await expect(page1.locator('text="Your details"')).toHaveCount(0);

	// Step 4: Unhide Field B
	await page1.getByRole('radio', { name: 'Yes' }).first().click();
	await expect(page1.locator('text="Your details"')).toBeVisible();

	await expect(page1.getByLabel('Your details')).toHaveValue(testValue);
});

test('Dropdown value should persist when hidden and then unhidden', async ({ page }) => {
	await page.goto('');

	// Toggle field
	await addField(page, 'Radio buttons', [
		{ label: 'Radio buttons question title', value: 'Show color?' },
	]);

	// Dropdown field
	await addField(page, 'Dropdown', [
		{
			label: 'Dropdown question title',
			value: 'Favorite color',
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Show color?',
					comparison: [{ type: 'Equals', value: 'Yes' }],
				},
			],
		},
	]);

	// Switch to preview mode
	const page1Promise = page.waitForEvent('popup');
	await page.getByRole('link', { name: 'View form' }).click();
	const page1 = await page1Promise;

	// Show the dropdown
	await page1.getByRole('radio', { name: 'Yes' }).first().click();
	await expect(page1.locator('text="Favorite color"')).toBeVisible();

	// Select a value
	await page1.getByRole('combobox', { name: 'Favorite color' }).selectOption('Red');
	await expect(page1.getByRole('combobox', { name: 'Favorite color' })).toHaveValue('Red');

	// Hide the dropdown
	await page1.getByRole('radio', { name: 'No' }).first().click();
	await expect(page1.locator('text="Favorite color"')).toHaveCount(0);

	// Unhide the dropdown
	await page1.getByRole('radio', { name: 'Yes' }).first().click();
	await expect(page1.locator('text="Favorite color"')).toBeVisible();

	await expect(page1.getByRole('combobox', { name: 'Favorite color' })).toHaveValue('Red');
});

test('Radio button selection should persist when hidden and then unhidden', async ({ page }) => {
	await page.goto('');

	// Toggle field
	await addField(page, 'Radio buttons', [
		{ label: 'Radio buttons question title', value: 'Show opinion?' },
	]);

	// Radio button field
	await addField(page, 'Radio buttons', [
		{
			label: 'Radio buttons question title',
			value: 'Do you agree?',
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Show opinion?',
					comparison: [{ type: 'Equals', value: 'Yes' }],
				},
			],
		},
	]);

	// Switch to preview mode
	const page1Promise = page.waitForEvent('popup');
	await page.getByRole('link', { name: 'View form' }).click();
	const page1 = await page1Promise;

	// Show the radio buttons
	await page1.getByRole('radio', { name: 'Yes' }).first().click();
	await expect(page1.locator('text="Do you agree?"')).toBeVisible();

	// Select "No" (the second set of Yes/No buttons)
	const allNoButtons = await page1.getByRole('radio', { name: 'No' }).all();
	await allNoButtons[1].click();
	await expect(allNoButtons[1]).toBeChecked();

	// Hide the radio buttons
	await page1.getByRole('radio', { name: 'No' }).first().click();
	await expect(page1.locator('text="Do you agree?"')).toHaveCount(0);

	// Unhide the radio buttons
	await page1.getByRole('radio', { name: 'Yes' }).first().click();
	await expect(page1.locator('text="Do you agree?"')).toBeVisible();

	const allNoButtonsAfter = await page1.getByRole('radio', { name: 'No' }).all();
	await expect(allNoButtonsAfter[1]).toBeChecked();
});
