import { test, expect } from '@playwright/test';
import {
	addField,
	clickCollectDataCheckbox,
	attemptSubmitWithExpectedFailure,
	submitExpectingSuccess,
	viewForm,
} from './test-utils';

test('checkbox min/max constraints in Editor and CollectData modes', async ({
	page,
	browserName,
}) => {
	// Set a desktop viewport
	await page.setViewportSize({ width: 2048, height: 800 });
	await page.goto('http://localhost:8000/');

	// 1. EDITOR MODE: Create a checkbox field with min/max constraints
	await addField(page, 'Checkboxes', undefined, {
		link: 'Checkboxes',
		label: 'Select your favorite fruits',
		description: 'Choose between 2 and 3 fruits',
		choices: ['Apple', 'Banana', 'Cherry', 'Durian', 'Elderberry'],
	});

	// Configure min constraint (2)
	await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
	await page.waitForTimeout(600);
	// Locate the 'Minimum required' input using its adjacent text label
	await page.locator('text="Minimum required" >> xpath=../input').fill('2');

	// Configure max constraint (3)
	await page.locator('text="Maximum allowed" >> xpath=../input').fill('3');

	// Close the editor - just click and wait without checking visibility
	await page.locator('.tff-close-button').click();
	await page.waitForTimeout(1000); // Give time for UI operations

	// 2. COLLECTDATA MODE: Test form validation with constraints
	const formPage = await viewForm(page);

	// Submit without selecting any checkbox - should fail validation
	await attemptSubmitWithExpectedFailure(formPage);

	// Select 1 checkbox (still below minimum) - should fail validation
	await clickCollectDataCheckbox(formPage, 'Apple', browserName);
	await attemptSubmitWithExpectedFailure(formPage);

	// Select 2nd checkbox (meets minimum) - should allow submission
	await clickCollectDataCheckbox(formPage, 'Banana', browserName);

	// Submit and verify success
	const response = await submitExpectingSuccess(formPage);

	// Verify submission was successful
	const responseBody = await response.json();
	expect(responseBody.form).toEqual({
		'Select your favorite fruits': ['Apple', 'Banana'],
	});

	// 3. Go back to the editor page
	await formPage.goBack();
	await page.waitForTimeout(500); // Wait for page to stabilize

	// Get the form view again
	const newFormPage = await viewForm(page);

	// Now select 4 checkboxes to exceed maximum (max=3)
	await newFormPage.getByLabel('Apple', { exact: true }).check();
	await newFormPage.waitForTimeout(100);
	await newFormPage.getByLabel('Banana', { exact: true }).check();
	await newFormPage.waitForTimeout(100);
	await newFormPage.getByLabel('Cherry', { exact: true }).check();
	await newFormPage.waitForTimeout(100);
	await newFormPage.getByLabel('Durian', { exact: true }).check();
	await page.waitForTimeout(200);

	// Test exceeding max limit - should fail validation
	await attemptSubmitWithExpectedFailure(newFormPage);

	// Uncheck one, bringing selection to valid range (3 checkboxes)
	await newFormPage.getByLabel('Durian', { exact: true }).uncheck();
	await newFormPage.waitForTimeout(200);

	// Submit and verify success
	const response2 = await submitExpectingSuccess(newFormPage);

	// Verify submission was successful
	const responseBody2 = await response2.json();
	expect(responseBody2.form).toEqual({
		'Select your favorite fruits': ['Apple', 'Banana', 'Cherry'],
	});
});

test('only min constraint validation', async ({ page, browserName }) => {
	// Set a desktop viewport
	await page.setViewportSize({ width: 2048, height: 800 });
	await page.goto('http://localhost:8000/');

	// Create a checkbox field with only min constraint
	await addField(page, 'Checkboxes', undefined, {
		link: 'Checkboxes',
		label: 'Select at least 2 colors',
		description: 'Minimum 2 selections required',
		choices: ['Red', 'Green', 'Blue', 'Yellow', 'Purple'],
	});

	// Configure min constraint (2)
	await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
	await page.waitForTimeout(600);
	// Locate the 'Minimum required' input using its adjacent text label
	await page.locator('text="Minimum required" >> xpath=../input').fill('2');

	// Close the editor - just click and wait without checking visibility
	await page.locator('.tff-close-button').click();
	await page.waitForTimeout(1000); // Give time for UI operations

	// COLLECTDATA MODE: Test form validation with min constraint
	const formPage = await viewForm(page);

	// Select only 1 checkbox - should fail validation
	await clickCollectDataCheckbox(formPage, 'Red', browserName);

	// Check for invalid checkbox styling instead of validation message
	await expect(formPage.locator('.tff-invalid-checkbox')).toBeVisible();

	await attemptSubmitWithExpectedFailure(formPage);

	// Select second checkbox (meets minimum) - should allow submission
	await clickCollectDataCheckbox(formPage, 'Green', browserName);

	// Submit and verify success
	const response = await submitExpectingSuccess(formPage);

	// Verify submission was successful
	const responseBody = await response.json();
	expect(responseBody.form).toEqual({
		'Select at least 2 colors': ['Red', 'Green'],
	});
});

test('only max constraint validation', async ({ page, browserName }) => {
	// Set a desktop viewport
	await page.setViewportSize({ width: 2048, height: 800 });
	await page.goto('http://localhost:8000/');

	// Create a checkbox field with only max constraint
	await addField(page, 'Checkboxes', undefined, {
		link: 'Checkboxes',
		label: 'Select up to 2 animals',
		description: 'Maximum 2 selections allowed',
		choices: ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit'],
	});

	// Configure max constraint (2)
	await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
	await page.waitForTimeout(600);
	await page.locator('text="Maximum allowed" >> xpath=../input').fill('2');

	// Close the editor - just click and wait without checking visibility
	await page.locator('.tff-close-button').click();
	await page.waitForTimeout(1000); // Give time for UI operations

	// COLLECTDATA MODE: Test form validation with max constraint
	const formPage = await viewForm(page);

	// Select 3 checkboxes (exceeding maximum) - should fail validation
	await clickCollectDataCheckbox(formPage, 'Dog', browserName);
	await clickCollectDataCheckbox(formPage, 'Cat', browserName);
	await clickCollectDataCheckbox(formPage, 'Bird', browserName);

	// Check for invalid checkbox styling instead of validation message
	await expect(formPage.locator('.tff-invalid-checkbox')).toBeVisible();

	await attemptSubmitWithExpectedFailure(formPage);

	// Uncheck one, bringing selection to valid range (2 checkboxes)
	await clickCollectDataCheckbox(formPage, 'Bird', browserName);

	// Submit and verify success
	const response = await submitExpectingSuccess(formPage);

	// Verify submission was successful
	const responseBody = await response.json();
	expect(responseBody.form).toEqual({
		'Select up to 2 animals': ['Dog', 'Cat'],
	});
});
