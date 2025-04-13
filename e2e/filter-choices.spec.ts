import { test, expect } from '@playwright/test';
import {
	addField,
	clickCollectDataCheckbox,
	attemptSubmitWithExpectedFailure,
	submitExpectingSuccess,
	viewForm,
} from './test-utils';

test('filter choices dynamically based on another field', async ({ page, browserName }) => {
	// Set a desktop viewport
	await page.setViewportSize({ width: 2048, height: 800 });
	await page.goto('http://localhost:8000/');

	// 1. Add a text field that will be used as the source for filtering
	await addField(page, 'Single-line free text', undefined, {
		link: 'Single-line free text',
		label: 'City prefix',
		description: 'Enter a prefix to filter cities',
	});

	// Close the editor and wait
	await page.waitForTimeout(600);

	// 2. Add a dropdown field with cities that will be filtered
	await addField(page, 'Dropdown', undefined, {
		link: 'Dropdown',
		label: 'Select a city',
		description: 'Cities will be filtered based on the prefix',
		choices: [
			'New York',
			'New Orleans',
			'Los Angeles',
			'San Francisco',
			'Chicago',
			'Boston',
			'Seattle',
		],
	});

	// Configure the dropdown to use filter
	await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
	await page.waitForTimeout(600);

	// Enable filtering
	await page.getByText('Filter choices').click();
	await page.waitForTimeout(600);

	// Set filter type to "Starts with"
	const filterTypeDropdown = page
		.locator('.tff-field-rule')
		.first()
		.locator('.tff-dropdown-group')
		.first()
		.locator('select');
	console.log('Selecting filter type: startswith');
	await filterTypeDropdown.selectOption('startswith');
	await page.waitForTimeout(500);

	// Set source field to the text field
	const sourceFieldDropdown = page
		.locator('.tff-field-rule')
		.first()
		.locator('.tff-dropdown-group')
		.last()
		.locator('select');
	console.log('Selecting source field: City prefix');
	await sourceFieldDropdown.selectOption('City prefix');
	await page.waitForTimeout(500);

	// Close the editor
	await page.locator('.tff-close-button').click();
	await page.waitForTimeout(1000);
	
	// Check that the source field has the "Affects logic" indicator
	const textFieldContainer = page.locator('.tff-field-container').first();
	const logicIndicator = textFieldContainer.locator('.tff-logic-indicator');
	await expect(logicIndicator).toBeVisible();
	await expect(logicIndicator).toHaveText('Affects logic');
	await expect(logicIndicator).toHaveClass(/tff-logic-indicator-gray/);
	await expect(logicIndicator).toHaveAttribute('title', "Other fields depend on this field's value");

	// 3. COLLECTDATA MODE: Test the filtering
	const formPage = await viewForm(page);

	// Initially all cities should be available in the dropdown
	const dropdown = formPage.locator('select');
	await expect(dropdown.locator('option[value="New York"]')).toBeAttached();
	await expect(dropdown.locator('option[value="Los Angeles"]')).toBeAttached();
	await expect(dropdown.locator('option[value="Chicago"]')).toBeAttached();

	// Enter "New" in the text field to filter cities
	await formPage.getByLabel('City prefix').fill('New');
	await formPage.waitForTimeout(600);

	// Only "New York" and "New Orleans" should be available in the dropdown
	await expect(dropdown.locator('option[value="New York"]')).toBeAttached();
	await expect(dropdown.locator('option[value="New Orleans"]')).toBeAttached();
	await expect(dropdown.locator('option[value="Los Angeles"]')).not.toBeAttached();
	await expect(dropdown.locator('option[value="San Francisco"]')).not.toBeAttached();

	// Change the filter to "San"
	await formPage.getByLabel('City prefix').fill('San');
	await formPage.waitForTimeout(600);

	// Only "San Francisco" should be available in the dropdown
	await expect(dropdown.locator('option[value="San Francisco"]')).toBeAttached();
	await expect(dropdown.locator('option[value="New York"]')).not.toBeAttached();

	// Select "San Francisco" and submit the form
	await dropdown.selectOption('San Francisco');

	// Submit and verify success
	const response = await submitExpectingSuccess(formPage);

	// Verify submission was successful
	const responseBody = await response.json();
	expect(responseBody.form).toEqual({
		'City prefix': 'San',
		'Select a city': 'San Francisco',
	});
});

test('filter choices with "contains" option', async ({ page, browserName }) => {
	// Set a desktop viewport
	await page.setViewportSize({ width: 2048, height: 800 });
	await page.goto('http://localhost:8000/');

	// 1. Add a text field that will be used as the source for filtering
	await addField(page, 'Single-line free text', undefined, {
		link: 'Single-line free text',
		label: 'Search term',
		description: 'Enter text to filter fruit options',
	});

	// Close the editor and wait
	await page.waitForTimeout(600);

	// 2. Add a radio button field with fruits that will be filtered
	await addField(page, 'Radio buttons', undefined, {
		link: 'Radio buttons',
		label: 'Choose a fruit',
		description: 'Fruits will be filtered based on your search',
		choices: [
			'Apple',
			'Pineapple',
			'Banana',
			'Strawberry',
			'Blackberry',
			'Orange',
			'Grapefruit',
		],
	});

	// Configure the radio buttons to use filter
	await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
	await page.waitForTimeout(600);

	// Enable filtering
	await page.getByText('Filter choices').click();
	await page.waitForTimeout(600);

	// Set filter type to "Contains"
	const filterTypeDropdown = page
		.locator('.tff-field-rule')
		.first()
		.locator('.tff-dropdown-group')
		.first()
		.locator('select');
	console.log('Selecting filter type: contains');
	await filterTypeDropdown.selectOption('contains');
	await page.waitForTimeout(500);

	// Set source field to the text field
	const sourceFieldDropdown = page
		.locator('.tff-field-rule')
		.first()
		.locator('.tff-dropdown-group')
		.last()
		.locator('select');
	console.log('Selecting source field: Search term');
	await sourceFieldDropdown.selectOption('Search term');
	await page.waitForTimeout(500);

	// Close the editor
	await page.locator('.tff-close-button').click();
	await page.waitForTimeout(1000);
	
	// Check that the source field has the "Affects logic" indicator
	const textFieldContainer = page.locator('.tff-field-container').first();
	const logicIndicator = textFieldContainer.locator('.tff-logic-indicator');
	await expect(logicIndicator).toBeVisible();
	await expect(logicIndicator).toHaveText('Affects logic');
	await expect(logicIndicator).toHaveClass(/tff-logic-indicator-gray/);
	await expect(logicIndicator).toHaveAttribute('title', "Other fields depend on this field's value");

	// 3. COLLECTDATA MODE: Test the filtering
	const formPage = await viewForm(page);

	// Initially all fruits should be available as radio options
	await expect(formPage.locator('input[value="Apple"]')).toBeAttached();
	await expect(formPage.locator('input[value="Banana"]')).toBeAttached();
	await expect(formPage.locator('input[value="Orange"]')).toBeAttached();

	// Enter "berry" in the text field to filter fruits
	await formPage.getByLabel('Search term').fill('berry');
	await formPage.waitForTimeout(600);

	// Only "Strawberry" and "Blackberry" should be available as radio options
	await expect(formPage.locator('input[value="Strawberry"]')).toBeAttached();
	await expect(formPage.locator('input[value="Blackberry"]')).toBeAttached();
	await expect(formPage.locator('input[value="Apple"]')).not.toBeAttached();
	await expect(formPage.locator('input[value="Banana"]')).not.toBeAttached();

	// Change the filter to "apple"
	await formPage.getByLabel('Search term').fill('apple');
	await formPage.waitForTimeout(600);

	// "Apple" and "Pineapple" should be available as radio options
	await expect(formPage.locator('input[value="Apple"]')).toBeAttached();
	await expect(formPage.locator('input[value="Pineapple"]')).toBeAttached();
	await expect(formPage.locator('input[value="Banana"]')).not.toBeAttached();

	// Select "Pineapple" and submit the form
	await formPage.getByLabel('Pineapple').check();

	// Submit and verify success
	const response = await submitExpectingSuccess(formPage);

	// Verify submission was successful
	const responseBody = await response.json();
	expect(responseBody.form).toEqual({
		'Search term': 'apple',
		'Choose a fruit': 'Pineapple',
	});
});

test('bug: filter field selection not retained visually when reopening field settings', async ({ page }) => {
	// Set a desktop viewport
	await page.setViewportSize({ width: 2048, height: 800 });
	await page.goto('http://localhost:8000/');

	// 1. Add a text field that will be used as the source for filtering
	await addField(page, 'Single-line free text', undefined, {
		link: 'Single-line free text',
		label: 'Filter field',
		description: 'Enter text to filter options',
	});

	// Close the editor and wait
	await page.waitForTimeout(600);

	// 2. Add a dropdown field with options that will be filtered
	await addField(page, 'Dropdown', undefined, {
		link: 'Dropdown',
		label: 'Filtered dropdown',
		description: 'Options will be filtered based on input',
		choices: ['Option 1', 'Option 2', 'Option 3'],
	});

	// Configure the dropdown to use filter
	await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
	await page.waitForTimeout(600);

	// Enable filtering
	await page.getByText('Filter choices').click();
	await page.waitForTimeout(600);

	// Set source field to the text field
	const sourceFieldDropdown = page
		.locator('.tff-field-rule')
		.first()
		.locator('.tff-dropdown-group')
		.last()
		.locator('select');
	await sourceFieldDropdown.selectOption('Filter field');
	await page.waitForTimeout(600);

	// Close the editor
	await page.locator('.tff-close-button').click();
	await page.waitForTimeout(1000);

	// Reopen the editor
	await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
	await page.waitForTimeout(1000);

	// BUG: The dropdown should show "Filter field" as the selected option,
	// but it doesn't appear to be set visually
	const reopenedDropdown = page
		.locator('.tff-field-rule')
		.first()
		.locator('.tff-dropdown-group')
		.last()
		.locator('select');
	
	// This assertion should pass if the bug is fixed
	await expect(reopenedDropdown).toHaveValue('Filter field');
});

test('bug: choices field should be hidden when filter field is empty', async ({ page }) => {
	// Set a desktop viewport
	await page.setViewportSize({ width: 2048, height: 800 });
	await page.goto('http://localhost:8000/');

	// 1. Add a text field that will be used as the source for filtering
	await addField(page, 'Single-line free text', undefined, {
		link: 'Single-line free text',
		label: 'Filter field',
		description: 'Enter text to filter options',
	});

	// Close the editor and wait
	await page.waitForTimeout(600);

	// 2. Add a dropdown field with options that will be filtered
	await addField(page, 'Dropdown', undefined, {
		link: 'Dropdown',
		label: 'Filtered dropdown',
		description: 'Options will be filtered based on input',
		choices: ['Option 1', 'Option 2', 'Option 3'],
	});

	// Configure the dropdown to use filter
	await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
	await page.waitForTimeout(600);

	// Enable filtering
	await page.getByText('Filter choices').click();
	await page.waitForTimeout(600);

	// Set filter type to "Contains"
	const filterTypeDropdown = page
		.locator('.tff-field-rule')
		.first()
		.locator('.tff-dropdown-group')
		.first()
		.locator('select');
	await filterTypeDropdown.selectOption('contains');
	await page.waitForTimeout(500);

	// Set source field to the text field
	const sourceFieldDropdown = page
		.locator('.tff-field-rule')
		.first()
		.locator('.tff-dropdown-group')
		.last()
		.locator('select');
	await sourceFieldDropdown.selectOption('Filter field');
	await page.waitForTimeout(600);

	// Close the editor
	await page.locator('.tff-close-button').click();
	await page.waitForTimeout(1000);

	// Go to COLLECTDATA MODE
	const formPage = await viewForm(page);
	await page.waitForTimeout(1000);

	// BUG: The dropdown should be hidden when the filter field is empty
	// This assertion should fail if the bug exists 
	await expect(formPage.getByLabel('Filtered dropdown')).not.toBeVisible();

	// When filter field has a value, the dropdown should become visible
	await formPage.getByLabel('Filter field').fill('Option');
	await page.waitForTimeout(600);
	await expect(formPage.getByLabel('Filtered dropdown')).toBeVisible();
});
