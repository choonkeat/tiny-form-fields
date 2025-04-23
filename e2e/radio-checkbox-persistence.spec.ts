import { test, expect } from '@playwright/test';
import { addField, viewForm, clickCollectDataCheckbox } from './test-utils';

// Regression test: selecting a radio button should not be reset when selecting a checkbox with minRequired=1
test('radio selection persists after required checkbox in CollectData mode', async ({
	page,
	browserName,
}) => {
	// Use a wide viewport
	await page.setViewportSize({ width: 2048, height: 800 });
	await page.goto('http://localhost:8000/');

	// 1. EDITOR MODE: add a radio button field
	await addField(page, 'Radio buttons', undefined, {
		link: 'Radio buttons',
		label: 'Pick One',
		choices: ['Alpha', 'Beta'],
		value: 'Alpha',
	});

	// 2. EDITOR MODE: add a checkbox field with minRequired = 1
	await addField(page, 'Checkboxes', undefined, {
		link: 'Checkboxes',
		label: 'Pick Check',
		choices: ['X', 'Y'],
		values: [],
	});
	// Open settings for the checkbox field
	await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
	await page.waitForTimeout(600);
	// Set minimum required to 1
	await page.locator('text="Minimum required" >> xpath=../input').fill('1');
	// Close editor panel
	await page.locator('.tff-close-button').click();
	await page.waitForTimeout(500);

	// 3. COLLECTDATA MODE: view the form
	const formPage = await viewForm(page);

	// Select the radio button option
	await formPage.getByLabel('Alpha', { exact: true }).click();
	await expect(formPage.getByLabel('Alpha', { exact: true })).toBeChecked();

	// Now select the checkbox (required min=1)
	await clickCollectDataCheckbox(formPage, 'X', browserName);
	// Checkbox should be checked
	await expect(formPage.getByLabel('X', { exact: true })).toBeChecked();

	// The radio selection should still be checked (regression guard)
	await expect(formPage.getByLabel('Alpha', { exact: true })).toBeChecked();
});
