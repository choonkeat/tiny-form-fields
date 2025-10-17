// tests/logic-indicators.spec.ts
import { test, expect } from '@playwright/test';
import { addField } from './test-utils';

test('Logic indicators display correct text for different field relationships', async ({
	page,
}) => {
	await page.goto('');

	// Add a dropdown field that will be referenced by other fields
	await addField(page, 'Dropdown', [{ label: 'Dropdown question title', value: 'Logic Source' }]);

	// Add a field that depends on the dropdown (will have "Contains logic")
	await addField(page, 'Single-line free text', [
		{
			label: 'Single-line free text question title',
			value: 'Dependent Field',
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Logic Source',
					comparison: [
						{
							type: 'Equals',
							value: 'Option A',
						},
					],
				},
			],
		},
	]);

	// Add another dropdown that will both have logic and be referenced
	await addField(page, 'Dropdown', [
		{ label: 'Dropdown question title', value: 'Both Logic Types' },
		// Add visibility rule so this field contains logic
		{
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Logic Source',
					comparison: [
						{
							type: 'Equals',
							value: 'Option B',
						},
					],
				},
			],
		},
	]);

	// Add a field that depends on the second dropdown
	// This makes the second dropdown both contain logic and affect logic
	await addField(page, 'Single-line free text', [
		{
			label: 'Single-line free text question title',
			value: 'Second Dependent Field',
			visibilityRule: [
				{
					type: 'Show this question when',
					field: 'Both Logic Types',
					comparison: [
						{
							type: 'Equals',
							value: 'Some Value',
						},
					],
				},
			],
		},
	]);

	// Wait for the page to stabilize
	await page.waitForTimeout(500);

	// Get all field containers
	const fieldContainers = page.locator('.tff-field-container');

	// Check the first field - should have "Affects logic" (gray)
	const firstFieldContainer = fieldContainers.nth(0).locator('.tff-logic-indicators-container');
	await expect(firstFieldContainer).toBeVisible();
	const firstFieldIndicator = firstFieldContainer.locator('.tff-logic-indicator').first();
	await expect(firstFieldIndicator).toBeVisible();
	await expect(firstFieldIndicator).toHaveText('Affects logic');
	await expect(firstFieldIndicator).toHaveClass(/tff-logic-indicator-gray/);

	// Check the second field - should have "Contains logic" (blue)
	const secondFieldContainer = fieldContainers.nth(1).locator('.tff-logic-indicators-container');
	await expect(secondFieldContainer).toBeVisible();
	const secondFieldIndicator = secondFieldContainer.locator('.tff-logic-indicator').first();
	await expect(secondFieldIndicator).toBeVisible();
	await expect(secondFieldIndicator).toHaveText('Contains logic');
	await expect(secondFieldIndicator).toHaveClass(/tff-logic-indicator-blue/);

	// Check the third field - should have "Contains & Affects logic" (blue)
	const thirdFieldContainer = fieldContainers.nth(2).locator('.tff-logic-indicators-container');
	await expect(thirdFieldContainer).toBeVisible();
	const thirdFieldIndicator = thirdFieldContainer.locator('.tff-logic-indicator').first();
	await expect(thirdFieldIndicator).toBeVisible();
	await expect(thirdFieldIndicator).toHaveText('Contains & affects logic');
	await expect(thirdFieldIndicator).toHaveClass(/tff-logic-indicator-blue/);

	// Verify tooltip contents
	await expect(firstFieldIndicator).toHaveAttribute(
		'title',
		"Other fields' visibility depends on this field's value"
	);
	await expect(secondFieldIndicator).toHaveAttribute('title', 'This field has visibility logic');
	await expect(thirdFieldIndicator).toHaveAttribute(
		'title',
		"This field has visibility logic and other fields' visibility depends on it"
	);
});
