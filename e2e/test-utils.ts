import { Page, expect, test as base } from '@playwright/test';

// Get the httpbin URL - this will be available in both Node and browser contexts
export function getHttpbinUrl(): string {
	// Check if we're in a test context with access to baseURL
	if (typeof process !== 'undefined') {
		// Node context - use env var directly
		return process.env.HTTPBIN_URL || 'https://httpbin.org/post?process';
	}
	// Browser context - this shouldn't happen as this function runs in Node
	return 'https://httpbin.org/post?fallback';
}

export interface FieldEdit {
	label?: string;
	value?: string;
	description?: string;
	maxlength?: number;
	choices?: string[];
	visibilityRule?: VisibilityRule[];
}

export interface FieldInput {
	link: string;
	label: string;
	description?: string;
	maxlength?: number;
	choices?: string[];
	value?: string;
	values?: string[];
	visibilityRule?: VisibilityRule[];
}

export interface VisibilityRule {
	type: 'Show this question when' | 'Hide this question when';
	field: string;
	comparison: Comparison[];
}

export interface Comparison {
	type: 'Equals' | 'StringContains' | 'EndsWith' | 'GreaterThan' | 'Equals (field)';
	value: string;
}

export async function clickCollectDataCheckbox(formPage, labelText, browserName = 'webkit') {
	if (browserName === 'firefox') {
		// For Firefox, locate the checkbox by value then click its parent element
		const checkbox = formPage.locator(`input[type=checkbox][value="${labelText}"]`);
		await checkbox.evaluate((node) => node.parentElement.click());
	} else {
		// Use label-based selector for other browsers
		await formPage.getByLabel(labelText, { exact: true }).click();
	}
	await formPage.waitForTimeout(200); // Consistent wait after checkbox interaction
}

export async function attemptSubmitWithExpectedFailure(formPage) {
	await formPage.getByRole('button', { name: 'Submit' }).click();
	await formPage.waitForTimeout(1000);

	// If validation works properly, the form won't navigate away
	expect(formPage.url()).not.toBe(getHttpbinUrl());
}

export async function submitExpectingSuccess(formPage) {
	// Prepare to intercept the form submission
	const responsePromise = formPage.waitForResponse(getHttpbinUrl(), {
		timeout: 30000,
	});

	await formPage.getByRole('button', { name: 'Submit' }).click();
	const response = await responsePromise;
	expect(response.ok()).toBeTruthy();
	return response;
}

export async function viewForm(page) {
	// Set form target URL to ensure consistency
	await page.locator('input#form_target_url').fill(getHttpbinUrl());

	// Open the form in a new window
	const formPagePromise = page.waitForEvent('popup');
	await page.getByRole('link', { name: 'View form' }).click();
	const formPage = await formPagePromise;
	await formPage.waitForLoadState('networkidle');

	return formPage;
}

export async function addField(
	page: Page,
	fieldType: string,
	edits?: FieldEdit[],
	input?: FieldInput
) {
	await page.getByRole('button', { name: fieldType, exact: true }).click();
	await page.waitForTimeout(600);
	await expect(page.getByText(`${fieldType} question title`)).toHaveCount(0);
	await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
	await page.waitForTimeout(600);
	await page.getByText(`${fieldType} question title`).click();

	if (input) {
		// Handle test-1.spec.ts style input
		await page.keyboard.press('ControlOrMeta+a');
		await page.keyboard.type(input.label);
		if (input.description) {
			await page.getByText('Question description').last().click();
			await page.waitForTimeout(100);
			await page.keyboard.press('Tab');
			await page.keyboard.type(input.description);
		}
		if (input.maxlength) {
			await page.getByText('Limit number of characters').last().click();
			await page.waitForTimeout(100);
			await page.keyboard.press('Tab');
			await page.keyboard.type(input.maxlength.toString());
		}
		if (input.choices) {
			await page.getByPlaceholder('Enter one choice per line').last().click();
			await page.keyboard.press('ControlOrMeta+a');
			await page.keyboard.type(input.choices.join('\n'));
		}
	} else if (edits) {
		// Handle visibility.spec.ts style edits
		for (const edit of edits) {
			if (
				edit.label === 'Question description' ||
				edit.label === 'Limit number of characters'
			) {
				await page.getByText(edit.label).last().click();
				await page.waitForTimeout(100);
				await page.keyboard.press('Tab');
			} else if (edit.label) {
				await page.getByText(edit.label).click();
			}
			if (edit.value) {
				await page.keyboard.press('ControlOrMeta+a');
				await page.keyboard.type(edit.value);
			}

			if (edit.visibilityRule) {
				for (const rule of edit.visibilityRule) {
					await page.getByRole('button', { name: 'Add field logic' }).click();
					await page.waitForTimeout(100);

					// Get the last field rule section
					const lastFieldRule = page.locator('.tff-field-rule').last();
					await lastFieldRule
						.locator('.tff-show-or-hide')
						.selectOption(
							rule.type === 'Show this question when' ? 'ShowWhen' : 'HideWhen'
						);
					await lastFieldRule.locator('.tff-question-title').selectOption(rule.field);

					for (const comparison of rule.comparison) {
						if (comparison !== rule.comparison[0]) {
							// For subsequent comparisons, click "Add condition"
							await page.getByRole('button', { name: 'Add condition' }).click();
							await page.waitForTimeout(100);
						}
						// Get the last condition group
						// Get the last condition group
						await lastFieldRule
							.locator('.tff-comparison-type')
							.last()
							.selectOption(comparison.type);

						// Handle EqualsField comparison differently (it's a select, not text input)
						if (comparison.type === 'Equals (field)') {
							// Wait for the field selector dropdown to appear
							await page.waitForTimeout(200);
							const fieldSelector = lastFieldRule
								.locator('select.tff-selectinput-select')
								.last();
							await fieldSelector.selectOption(comparison.value);
						} else {
							await lastFieldRule.locator('.tff-comparison-value').last().click();
							await page.keyboard.type(comparison.value);
						}
					}
				}
			}
		}
	}

	await page.locator('.tff-close-button').click();
}
