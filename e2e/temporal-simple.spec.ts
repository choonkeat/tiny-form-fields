import { test, expect } from '@playwright/test';
import { viewForm, getHttpbinUrl } from './test-utils';

test.describe('Temporal Input CSS Classes - Simple', () => {
	test('should apply tff-empty-optional class correctly for temporal inputs', async ({
		page,
	}) => {
		// Set a desktop viewport
		await page.setViewportSize({ width: 2048, height: 800 });

		// Navigate directly to a URL with pre-configured temporal fields
		const temporalFields = [
			{
				id: 'field-1',
				fieldType: 'ShortText',
				shortTextType: 'Date',
				label: 'Required Date Field',
				description: 'This is a required date field',
				required: true,
			},
			{
				id: 'field-2',
				fieldType: 'ShortText',
				shortTextType: 'Date',
				label: 'Optional Date Field',
				description: 'This is an optional date field',
				required: false,
			},
			{
				id: 'field-3',
				fieldType: 'ShortText',
				shortTextType: 'Time',
				label: 'Required Time Field',
				description: 'This is a required time field',
				required: true,
			},
			{
				id: 'field-4',
				fieldType: 'ShortText',
				shortTextType: 'Time',
				label: 'Optional Time Field',
				description: 'This is an optional time field',
				required: false,
			},
		];

		const hashParams = `viewMode=CollectData&formFields=${encodeURIComponent(JSON.stringify(temporalFields))}&_url=${encodeURIComponent(getHttpbinUrl())}`;
		await page.goto(`http://localhost:8000/#${hashParams}`);
		await page.waitForLoadState('networkidle');

		// Test all temporal inputs
		const inputs = await page.locator('input[type="date"], input[type="time"]').all();

		for (let i = 0; i < inputs.length; i++) {
			const input = inputs[i];
			const field = temporalFields[i];

			const classes = await input.getAttribute('class');
			const requiredAttr = await input.getAttribute('required');
			const isRequired = requiredAttr !== null;
			const value = await input.inputValue();

			// Verify field setup
			expect(isRequired).toBe(field.required);
			expect(value).toBe(''); // All fields should start empty

			// Check CSS classes
			expect(classes).toContain('tff-text-field');

			if (field.required) {
				// Required fields should NOT have tff-empty-optional class
				expect(classes).not.toContain('tff-empty-optional');
			} else {
				// Optional empty fields SHOULD have tff-empty-optional class
				expect(classes).toContain('tff-empty-optional');
			}
		}

		// Test filling values and checking classes update
		const testValues = ['2024-01-15', '2024-01-16', '14:30', '15:45'];

		for (let i = 0; i < inputs.length; i++) {
			const input = inputs[i];
			const testValue = testValues[i];

			await input.fill(testValue);
			await page.waitForTimeout(100);

			const classes = await input.getAttribute('class');
			const value = await input.inputValue();

			// Verify value was set
			expect(value).toBe(testValue);

			// All filled fields should only have tff-text-field class (no tff-empty-optional)
			expect(classes).toContain('tff-text-field');
			expect(classes).not.toContain('tff-empty-optional');
		}

		// Test clearing optional fields and verify classes return
		for (let i = 0; i < inputs.length; i++) {
			const input = inputs[i];
			const field = temporalFields[i];

			if (!field.required) {
				// Clear the optional field
				await input.fill('');
				await page.waitForTimeout(100);

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
});
