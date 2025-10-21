import { test, expect } from '@playwright/test';
import { addField, viewForm } from './test-utils';

test.describe('Temporal Input CSS Classes', () => {
	test('should apply tff-empty-optional class correctly for temporal inputs', async ({
		page,
	}) => {
		// Set a desktop viewport
		await page.setViewportSize({ width: 2048, height: 800 });
		await page.goto('');

		// Create temporal fields with all combinations of required/optional
		const temporalFields = [
			// Date fields
			{
				link: 'Date',
				label: 'Required Date Field',
				description: 'This is a required date field',
				isRequired: true,
				type: 'date',
			},
			{
				link: 'Date',
				label: 'Optional Date Field',
				description: 'This is an optional date field',
				isRequired: false,
				type: 'date',
			},
			// Time fields
			{
				link: 'Time',
				label: 'Required Time Field',
				description: 'This is a required time field',
				isRequired: true,
				type: 'time',
			},
			{
				link: 'Time',
				label: 'Optional Time Field',
				description: 'This is an optional time field',
				isRequired: false,
				type: 'time',
			},
			// DateTime fields
			{
				link: 'Date & Time',
				label: 'Required DateTime Field',
				description: 'This is a required datetime field',
				isRequired: true,
				type: 'datetime-local',
			},
			{
				link: 'Date & Time',
				label: 'Optional DateTime Field',
				description: 'This is an optional datetime field',
				isRequired: false,
				type: 'datetime-local',
			},
		];

		// Add all temporal fields
		for (const field of temporalFields) {
			await addField(page, field.link, undefined, {
				label: field.label,
				description: field.description,
			});

			// Set required/optional status
			if (!field.isRequired) {
				// Reopen field settings since addField closes them
				await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
				await page.waitForTimeout(500); // Wait for field settings to stabilize

				// Find and uncheck the required checkbox
				const requiredCheckbox = page.locator('input[type="checkbox"]').first();
				if (await requiredCheckbox.isChecked()) {
					await requiredCheckbox.uncheck();
				}
				await page.waitForTimeout(200);
				await page.locator('.tff-close-button').click({ force: true });
			}
		}

		// Switch to CollectData mode to test the classes
		const formPage = await viewForm(page);

		// Test 1: Check initial state (all fields empty)
		await test.step('Check empty fields have correct classes', async () => {
			const inputs = await formPage
				.locator('input[type="date"], input[type="time"], input[type="datetime-local"]')
				.all();

			for (let i = 0; i < inputs.length; i++) {
				const input = inputs[i];
				const field = temporalFields[i];

				const classes = await input.getAttribute('class');
				const requiredAttr = await input.getAttribute('required');
				const isRequired = requiredAttr !== null;
				const value = await input.inputValue();

				// Verify field setup
				expect(isRequired).toBe(field.isRequired);
				expect(value).toBe(''); // All fields should start empty

				// Check CSS classes
				expect(classes).toContain('tff-text-field');

				if (field.isRequired) {
					// Required fields should NOT have tff-empty-optional class
					expect(classes).not.toContain('tff-empty-optional');
				} else {
					// Optional empty fields SHOULD have tff-empty-optional class
					expect(classes).toContain('tff-empty-optional');
				}
			}
		});

		// Test 2: Fill values and check classes update
		await test.step('Check filled fields have correct classes', async () => {
			const testValues = {
				date: '2024-01-15',
				time: '14:30',
				'datetime-local': '2024-01-15T14:30',
			};

			const inputs = await formPage
				.locator('input[type="date"], input[type="time"], input[type="datetime-local"]')
				.all();

			// Fill all fields with values
			for (let i = 0; i < inputs.length; i++) {
				const input = inputs[i];
				const field = temporalFields[i];
				const testValue = testValues[field.type];

				await input.fill(testValue);
				await formPage.waitForTimeout(100); // Allow for any potential DOM updates

				const classes = await input.getAttribute('class');
				const value = await input.inputValue();

				// Verify value was set
				expect(value).toBe(testValue);

				// All filled fields should only have tff-text-field class (no tff-empty-optional)
				expect(classes).toContain('tff-text-field');
				expect(classes).not.toContain('tff-empty-optional');
			}
		});

		// Test 3: Clear optional fields and verify classes return
		await test.step('Check cleared optional fields regain tff-empty-optional class', async () => {
			const inputs = await formPage
				.locator('input[type="date"], input[type="time"], input[type="datetime-local"]')
				.all();

			for (let i = 0; i < inputs.length; i++) {
				const input = inputs[i];
				const field = temporalFields[i];

				if (!field.isRequired) {
					// Clear the optional field
					await input.fill('');
					await formPage.waitForTimeout(100);

					const classes = await input.getAttribute('class');
					const value = await input.inputValue();

					// Verify field is empty
					expect(value).toBe('');

					// Optional empty field should have tff-empty-optional class again
					expect(classes).toContain('tff-text-field');
					expect(classes).toContain('tff-empty-optional');
				}
			}
		});

		// Test 4: Verify required fields never get tff-empty-optional
		await test.step('Check required fields never get tff-empty-optional class', async () => {
			const inputs = await formPage
				.locator('input[type="date"], input[type="time"], input[type="datetime-local"]')
				.all();

			for (let i = 0; i < inputs.length; i++) {
				const input = inputs[i];
				const field = temporalFields[i];

				if (field.isRequired) {
					// Clear the required field
					await input.fill('');
					await formPage.waitForTimeout(100);

					const classes = await input.getAttribute('class');
					const value = await input.inputValue();

					// Verify field is empty
					expect(value).toBe('');

					// Required fields should NEVER have tff-empty-optional class, even when empty
					expect(classes).toContain('tff-text-field');
					expect(classes).not.toContain('tff-empty-optional');
				}
			}
		});
	});

	test('should work correctly in Editor mode as well', async ({ page }) => {
		// Set a desktop viewport
		await page.setViewportSize({ width: 2048, height: 800 });
		await page.goto('');

		// Add one optional temporal field
		await addField(page, 'Date', undefined, {
			label: 'Test Optional Date',
			description: 'Test field',
		});

		// Make it optional - reopen field settings first
		await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
		await page.waitForTimeout(500);

		// Find and uncheck the required checkbox
		const requiredCheckbox = page.locator('input[type="checkbox"]').first();
		if (await requiredCheckbox.isChecked()) {
			await requiredCheckbox.uncheck();
		}
		await page.waitForTimeout(200);
		await page.locator('.tff-close-button').click({ force: true });

		// Check the preview in Editor mode
		const previewInput = page.locator('.tff-field-container input[type="date"]').first();
		await expect(previewInput).toBeVisible();

		const classes = await previewInput.getAttribute('class');
		const requiredAttr = await previewInput.getAttribute('required');
		const isRequired = requiredAttr !== null;
		const value = await previewInput.inputValue();

		// Verify it's set up as optional and empty
		expect(isRequired).toBe(false);
		expect(value).toBe('');

		// In Editor mode, the preview should also have correct classes
		expect(classes).toContain('tff-text-field');
		expect(classes).toContain('tff-empty-optional');
	});

	test('should handle dynamic changes between required and optional', async ({ page }) => {
		// Set a desktop viewport
		await page.setViewportSize({ width: 2048, height: 800 });
		await page.goto('');

		// Add a date field (starts as required by default)
		await addField(page, 'Date', undefined, {
			label: 'Dynamic Date Field',
			description: 'This field will change between required and optional',
		});

		// Initially should be required - check editor preview
		let previewInput = page.locator('.tff-field-container input[type="date"]').first();
		let classes = await previewInput.getAttribute('class');
		let isRequired = (await previewInput.getAttribute('required')) !== null;

		expect(isRequired).toBe(true);
		expect(classes).toContain('tff-text-field');
		expect(classes).not.toContain('tff-empty-optional');

		// Change to optional - reopen field settings first
		await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
		await page.waitForTimeout(500);

		// Find and uncheck the required checkbox
		const requiredCheckbox1 = page.locator('input[type="checkbox"]').first();
		if (await requiredCheckbox1.isChecked()) {
			await requiredCheckbox1.uncheck();
		}
		await page.waitForTimeout(200);

		// Check classes updated in editor preview
		classes = await previewInput.getAttribute('class');
		const requiredAttr2 = await previewInput.getAttribute('required');
		isRequired = requiredAttr2 !== null;

		expect(isRequired).toBe(false);
		expect(classes).toContain('tff-text-field');
		expect(classes).toContain('tff-empty-optional');

		// Change back to required - reopen field settings first
		await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
		await page.waitForTimeout(500);

		// Find and check the required checkbox
		const requiredCheckbox2 = page.locator('input[type="checkbox"]').first();
		if (!(await requiredCheckbox2.isChecked())) {
			await requiredCheckbox2.check();
		}
		await page.waitForTimeout(200);

		// Check classes updated again
		classes = await previewInput.getAttribute('class');
		const requiredAttrAgain = await previewInput.getAttribute('required');
		isRequired = requiredAttrAgain !== null;

		expect(isRequired).toBe(true);
		expect(classes).toContain('tff-text-field');
		expect(classes).not.toContain('tff-empty-optional');

		await page.locator('.tff-close-button').click({ force: true });

		// Also test in CollectData mode
		const formPage = await viewForm(page);
		const collectInput = formPage.locator('input[type="date"]').first();

		classes = await collectInput.getAttribute('class');
		const requiredAttr3 = await collectInput.getAttribute('required');
		isRequired = requiredAttr3 !== null;

		expect(isRequired).toBe(true);
		expect(classes).toContain('tff-text-field');
		expect(classes).not.toContain('tff-empty-optional');
	});
});
