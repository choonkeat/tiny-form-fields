// tests/cascading-visibility-bug.spec.ts
// Tests for PR49: Hidden field values should not affect other fields' visibility
import { test, expect } from '@playwright/test';
import { addField } from './test-utils';

test('Cascading visibility - Field C depends on hidden Field B value (THE BUG)', async ({
	page,
}) => {
	await page.goto('');

	// Field A: "Do you have a car?"
	await addField(page, 'Radio buttons', [
		{ label: 'Radio buttons question title', value: 'Do you have a car?' },
	]);

	// Field B: "Car brand" - shown when Field A = "Yes"
	await addField(page, 'Single-line free text', [
		{
			label: 'Single-line free text question title',
			value: 'Car brand',
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Do you have a car?',
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

	// Field C: "Do you prefer Japanese brands?" - shown when Field B = "Toyota"
	await addField(page, 'Radio buttons', [
		{
			label: 'Radio buttons question title',
			value: 'Do you prefer Japanese brands?',
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Car brand',
					comparison: [
						{
							type: 'Equals',
							value: 'Toyota',
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

	// Step 1: User selects "Yes" for has car
	await page1.getByRole('radio', { name: 'Yes' }).first().click();

	// Field B (Car brand) should appear
	await expect(page1.locator('text="Car brand"')).toBeVisible();

	// Step 2: User enters "Toyota" in car brand
	await page1.getByLabel('Car brand').fill('Toyota');

	// Field C (prefer Japanese) should appear
	await expect(page1.locator('text="Do you prefer Japanese brands?"')).toBeVisible();

	// Step 3: User changes their mind and selects "No" for has car
	await page1.getByRole('radio', { name: 'No' }).first().click();

	// Field B should be hidden (correct)
	await expect(page1.locator('text="Car brand"')).toHaveCount(0);

	// Field C should ALSO be hidden (this was the bug - it would stay visible)
	// Because Field B is hidden, its value "Toyota" should not affect Field C's visibility
	await expect(page1.locator('text="Do you prefer Japanese brands?"')).toHaveCount(0);
});

test('Deep cascading visibility - A→B→C→D all cascade', async ({ page }) => {
	await page.goto('');

	// Field A: Control field
	await addField(page, 'Radio buttons', [
		{ label: 'Radio buttons question title', value: 'Field A' },
	]);

	// Field B: Shown when A = "Yes"
	await addField(page, 'Single-line free text', [
		{
			label: 'Single-line free text question title',
			value: 'Field B',
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Field A',
					comparison: [{ type: 'Equals', value: 'Yes' }],
				},
			],
		},
	]);

	// Field C: Shown when B = "EnableC"
	await addField(page, 'Single-line free text', [
		{
			label: 'Single-line free text question title',
			value: 'Field C',
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Field B',
					comparison: [{ type: 'Equals', value: 'EnableC' }],
				},
			],
		},
	]);

	// Field D: Shown when C = "EnableD"
	await addField(page, 'Single-line free text', [
		{
			label: 'Single-line free text question title',
			value: 'Field D',
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Field C',
					comparison: [{ type: 'Equals', value: 'EnableD' }],
				},
			],
		},
	]);

	// Switch to preview mode
	const page1Promise = page.waitForEvent('popup');
	await page.getByRole('link', { name: 'View form' }).click();
	const page1 = await page1Promise;

	// Build up the cascade
	await page1.getByRole('radio', { name: 'Yes' }).first().click();
	await expect(page1.locator('text="Field B"')).toBeVisible();

	await page1.getByLabel('Field B').fill('EnableC');
	await expect(page1.locator('text="Field C"')).toBeVisible();

	await page1.getByLabel('Field C').fill('EnableD');
	await expect(page1.locator('text="Field D"')).toBeVisible();

	// Now break the cascade at the top
	await page1.getByRole('radio', { name: 'No' }).first().click();

	// All downstream fields should disappear
	await expect(page1.locator('text="Field B"')).toHaveCount(0);
	await expect(page1.locator('text="Field C"')).toHaveCount(0);
	await expect(page1.locator('text="Field D"')).toHaveCount(0);
});

test('StringContains with hidden field', async ({ page }) => {
	await page.goto('');

	// Enable toggle
	await addField(page, 'Radio buttons', [
		{ label: 'Radio buttons question title', value: 'Enable description?' },
	]);

	// Description field - use Single-line instead to avoid the Multi-line button name issue
	await addField(page, 'Single-line free text', [
		{
			label: 'Single-line free text question title',
			value: 'Description',
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Enable description?',
					comparison: [{ type: 'Equals', value: 'Yes' }],
				},
			],
		},
	]);

	// Urgent note - shown when description contains "urgent"
	await addField(page, 'Single-line free text', [
		{
			label: 'Single-line free text question title',
			value: 'Urgent Note',
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Description',
					comparison: [{ type: 'StringContains', value: 'urgent' }],
				},
			],
		},
	]);

	// Switch to preview mode
	const page1Promise = page.waitForEvent('popup');
	await page.getByRole('link', { name: 'View form' }).click();
	const page1 = await page1Promise;

	// Enable description and add urgent text
	await page1.getByRole('radio', { name: 'Yes' }).first().click();
	await expect(page1.locator('text="Description"')).toBeVisible();

	await page1.getByLabel('Description').fill('This is urgent');
	await expect(page1.locator('text="Urgent Note"')).toBeVisible();

	// Disable description
	await page1.getByRole('radio', { name: 'No' }).first().click();

	// Both Description and Urgent Note should be hidden
	await expect(page1.locator('text="Description"')).toHaveCount(0);
	await expect(page1.locator('text="Urgent Note"')).toHaveCount(0);
});

test('EqualsField with hidden target field', async ({ page }) => {
	await page.goto('');

	// Show confirmation toggle
	await addField(page, 'Radio buttons', [
		{ label: 'Radio buttons question title', value: 'Show email confirmation?' },
	]);

	// Email field (always visible in this test)
	await addField(page, 'Email', [{ label: 'Email question title', value: 'Email' }]);

	// Confirm Email - shown when toggle = "Yes"
	await addField(page, 'Email', [
		{
			label: 'Email question title',
			value: 'Confirm Email',
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Show email confirmation?',
					comparison: [{ type: 'Equals', value: 'Yes' }],
				},
			],
		},
	]);

	// Submit blocker - hidden when Email equals Confirm Email
	await addField(page, 'Single-line free text', [
		{
			label: 'Single-line free text question title',
			value: 'Emails must match to submit',
			visibilityRule: [
				{
					type: 'Hide this question when',
					field: 'Email',
					comparison: [{ type: 'Equals (field)', value: 'Confirm Email' }],
				},
			],
		},
	]);

	// Switch to preview mode
	const page1Promise = page.waitForEvent('popup');
	await page.getByRole('link', { name: 'View form' }).click();
	const page1 = await page1Promise;

	// Enter matching emails with confirmation visible
	await page1.getByRole('radio', { name: 'Yes' }).first().click();
	await page1.getByLabel('Email').first().fill('test@example.com');
	await page1.getByLabel('Confirm Email').fill('test@example.com');

	// Blocker should be hidden (emails match)
	await expect(page1.locator('text="Emails must match to submit"')).toHaveCount(0);

	// Now hide the confirmation field
	await page1.getByRole('radio', { name: 'No' }).first().click();

	// Confirm Email is hidden
	await expect(page1.locator('text="Confirm Email"')).toHaveCount(0);

	// Blocker should now be VISIBLE because Confirm Email is hidden,
	// so the EqualsField comparison fails (Email != empty)
	await expect(page1.locator('text="Emails must match to submit"')).toBeVisible();
});
