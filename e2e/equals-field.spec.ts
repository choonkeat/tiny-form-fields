import { test, expect } from '@playwright/test';
import { addField } from './test-utils';

const fieldHandle = '.tff-field-container .tff-drag-handle-icon';

test('Equals(field) dropdown disabled when no other fields and excludes self', async ({ page }) => {
	await page.goto('');

	// Set a desktop viewport
	await page.setViewportSize({ width: 2048, height: 800 });
	await page.goto('');

	await test.step('Create an email field', async () => {
		await addField(page, 'Email', undefined, {
			link: 'Email',
			label: 'Enter email',
		});
	});

	await test.step('Check EqualsField disabled with no other fields', async () => {
		// Reopen field settings to configure
		await page.locator(fieldHandle).last().click();
		await expect(page.getByText('Email question title')).toHaveCount(1);

		// Add field logic (field rule)
		await page.getByRole('button', { name: 'Add field logic' }).click();
		const fieldRule = page.locator('.tff-field-rule').last();

		// EqualsField option should be disabled because there are no other fields
		const equalsOption = fieldRule.locator(
			'select.tff-comparison-type option[value="EqualsField"]'
		);
		await expect(equalsOption).toBeDisabled();

		// Remove logic
		await fieldRule.locator('.tff-show-or-hide').selectOption({ index: 0 });
		await expect(fieldRule).not.toBeVisible();

		// Close editor
		await page.locator('.tff-close-button').click();
	});

	await test.step('Add another email field', async () => {
		await addField(page, 'Email', undefined, {
			link: 'Email',
			label: 'Confirm email',
		});
	});

	await test.step('Verify EqualsField dropdown excludes self', async () => {
		await page.locator(fieldHandle).last().click();
		await expect(page.getByText('Email question title')).toHaveCount(1);
		await page.getByRole('button', { name: 'Add field logic' }).click();
		const fieldRule = page.locator('.tff-field-rule').last();

		// Add a condition and set its comparison to EqualsField
		await fieldRule.locator('.tff-comparison-type').last().selectOption('EqualsField');
		await expect(fieldRule.locator('.tff-comparison-value')).toBeDisabled();

		// Remove logic
		await fieldRule.locator('.tff-show-or-hide').selectOption({ index: 0 });
		await expect(fieldRule).not.toBeVisible();
	});

	await test.step('Add a field that only shows when both email fields are equal', async () => {
		await addField(page, 'Single-line free text', undefined, {
			link: 'Single-line free text',
			label: 'Show if emails match',
			description: 'Show if emails match',
		});

		await page.locator(fieldHandle).last().click();
		await expect(page.getByText('Single-line free text question title')).toHaveCount(1);
		await page.getByRole('button', { name: 'Add field logic' }).click();
		const fieldRule = page.locator('.tff-field-rule').last();

		const equalsOption = fieldRule.locator(
			'select.tff-comparison-type option[value="EqualsField"]'
		);
		await expect(equalsOption).toBeEnabled();
		await fieldRule.locator('.tff-comparison-type').last().selectOption('EqualsField');

		page.locator('select.tff-text-field.tff-question-title').last().selectOption('Enter email');
	});

	await test.step('Verify form field logic works', async () => {
		const pagePromise = page.waitForEvent('popup');
		await page.getByRole('link', { name: 'View form' }).click();
		const newPage = await pagePromise;

		await expect(newPage.getByLabel('Enter email')).toBeVisible();
		await expect(newPage.getByLabel('Confirm email')).toBeVisible();
		await expect(newPage.getByLabel('Show if emails match')).not.toBeVisible();

		await newPage.getByLabel('Enter email').fill('test@example.com');
		await newPage.getByLabel('Confirm email').fill('test@example.com');
		await expect(newPage.getByLabel('Show if emails match')).toBeVisible();
	});

	// Close editor
	await page.locator('.tff-close-button').click();
});
