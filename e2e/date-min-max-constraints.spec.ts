import { test, expect } from '@playwright/test';
import {
	addField,
	attemptSubmitWithExpectedFailure,
	submitExpectingSuccess,
	viewForm,
} from './test-utils';

test.describe('Date Min/Max Constraints', () => {
	test('date min/max dates in Editor mode and validate in CollectData mode', async ({ page }) => {
		// Set a desktop viewport
		await page.setViewportSize({ width: 2048, height: 800 });
		await page.goto('');

		// 1. EDITOR MODE: Create a date field with min/max constraints
		await addField(page, 'Date', undefined, {
			link: 'Date',
			label: 'Event Date',
			description: 'Select a date between 2024-01-01 and 2024-12-31',
		});

		// Reopen field settings to configure min/max constraints
		await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
		await page.waitForTimeout(600);

		// Configure minimum date
		// Click the checkbox to enable minimum date
		await page.getByLabel('Minimum date').click();
		await page.waitForTimeout(200);

		// Fill the minimum date input (now that it's enabled)
		// Wait for the input to become enabled after checkbox click
		await page.waitForTimeout(500);
		const minDateInput = page
			.locator('.tff-toggle-group')
			.filter({ hasText: 'Minimum date' })
			.locator('input[type="date"]');
		await minDateInput.fill('2024-01-01');

		// Configure maximum date
		// Click the checkbox to enable maximum date
		await page.getByLabel('Maximum date').click();
		await page.waitForTimeout(200);

		// Fill the maximum date input (now that it's enabled)
		// Wait for the input to become enabled after checkbox click
		await page.waitForTimeout(500);
		const maxDateInput = page
			.locator('.tff-toggle-group')
			.filter({ hasText: 'Maximum date' })
			.locator('input[type="date"]');
		await maxDateInput.fill('2024-12-31');

		// Close the editor
		await page.locator('.tff-close-button').click();
		await page.waitForTimeout(500);

		// 2. COLLECTDATA MODE: Test form validation with constraints
		const formPage = await viewForm(page);

		// Test Case 1: Submit with date before minimum - should fail
		const dateField = formPage.locator('input[type="date"]').first();
		await dateField.fill('2023-12-31'); // Before min date
		await attemptSubmitWithExpectedFailure(formPage);

		// Test Case 2: Submit with date after maximum - should fail
		await dateField.fill('2025-01-01'); // After max date
		await attemptSubmitWithExpectedFailure(formPage);

		// Test Case 3: Submit with valid date within range - should succeed
		await dateField.fill('2024-06-15'); // Within valid range
		const response = await submitExpectingSuccess(formPage);
		const responseBody = await response.json();
		expect(responseBody.form).toEqual({
			'Event Date': '2024-06-15',
		});
	});

	test('only min constraint', async ({ page }) => {
		await page.setViewportSize({ width: 2048, height: 800 });
		await page.goto('');

		// Create date field with only minimum constraint
		await addField(page, 'Date', undefined, {
			link: 'Date',
			label: 'Start Date',
			description: 'Must be after 2024-01-01',
		});

		// Configure only minimum date
		await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
		await page.waitForTimeout(600);

		// Click the checkbox to enable minimum date
		await page.getByLabel('Minimum date').click();
		await page.waitForTimeout(200);

		const minDateInput = page
			.locator('label:has-text("Minimum date")')
			.locator('..')
			.locator('input[type="date"]');
		await minDateInput.fill('2024-01-01');

		await page.locator('.tff-close-button').click();
		await page.waitForTimeout(500);

		const formPage = await viewForm(page);
		const dateField = formPage.locator('input[type="date"]').first();

		// Test before min - should fail
		await dateField.fill('2023-12-31');
		await attemptSubmitWithExpectedFailure(formPage);

		// Test after min - should succeed (no max constraint)
		await dateField.fill('2025-06-15');
		const response = await submitExpectingSuccess(formPage);
		const responseBody = await response.json();
		expect(responseBody.form).toEqual({
			'Start Date': '2025-06-15',
		});
	});

	test('only max constraint', async ({ page }) => {
		await page.setViewportSize({ width: 2048, height: 800 });
		await page.goto('');

		// Create date field with only maximum constraint
		await addField(page, 'Date', undefined, {
			link: 'Date',
			label: 'Deadline',
			description: 'Must be before 2024-12-31',
		});

		// Configure only maximum date
		await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
		await page.waitForTimeout(600);

		// Click the checkbox to enable maximum date
		await page.getByLabel('Maximum date').click();
		await page.waitForTimeout(200);

		const maxDateInput = page
			.locator('label:has-text("Maximum date")')
			.locator('..')
			.locator('input[type="date"]');
		await maxDateInput.fill('2024-12-31');

		await page.locator('.tff-close-button').click();
		await page.waitForTimeout(500);

		const formPage = await viewForm(page);
		const dateField = formPage.locator('input[type="date"]').first();

		// Test after max - should fail
		await dateField.fill('2025-01-01');
		await attemptSubmitWithExpectedFailure(formPage);

		// Test before max - should succeed (no min constraint)
		await dateField.fill('2023-06-15');
		const response = await submitExpectingSuccess(formPage);
		const responseBody = await response.json();
		expect(responseBody.form).toEqual({
			Deadline: '2023-06-15',
		});
	});

	test('should handle edge case where min equals max', async ({ page }) => {
		await page.setViewportSize({ width: 2048, height: 800 });
		await page.goto('');

		// Create date field where min and max are the same
		await addField(page, 'Date', undefined, {
			link: 'Date',
			label: 'Exact Date Required',
			description: 'Must be exactly 2024-07-04',
		});

		// Configure min and max to be the same
		await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
		await page.waitForTimeout(600);

		// Click the checkbox to enable minimum date
		await page.getByLabel('Minimum date').click();
		await page.waitForTimeout(200);
		const minDateInput = page
			.locator('label:has-text("Minimum date")')
			.locator('..')
			.locator('input[type="date"]');
		await minDateInput.fill('2024-07-04');

		// Click the checkbox to enable maximum date
		await page.getByLabel('Maximum date').click();
		await page.waitForTimeout(200);
		const maxDateInput = page
			.locator('label:has-text("Maximum date")')
			.locator('..')
			.locator('input[type="date"]');
		await maxDateInput.fill('2024-07-04');

		await page.locator('.tff-close-button').click();
		await page.waitForTimeout(500);

		const formPage = await viewForm(page);
		const dateField = formPage.locator('input[type="date"]').first();

		// Test before the exact date - should fail
		await dateField.fill('2024-07-03');
		await attemptSubmitWithExpectedFailure(formPage);

		// Test after the exact date - should fail
		await dateField.fill('2024-07-05');
		await attemptSubmitWithExpectedFailure(formPage);

		// Test the exact date - should succeed
		await dateField.fill('2024-07-04');
		const response = await submitExpectingSuccess(formPage);
		const responseBody = await response.json();
		expect(responseBody.form).toEqual({
			'Exact Date Required': '2024-07-04',
		});
	});
});
