import { test, expect } from '@playwright/test';

/**
 * Virtual DOM Reconciliation Bug Test
 *
 * Bug Description:
 * When a form with conditional fields was displayed and the condition was met (clicking "Yes"),
 * the conditionally visible text input field would lose its CSS classes. This happened because
 * the virtual DOM was incorrectly reusing existing DOM nodes when the form structure changed.
 *
 * Specifically, a hidden validation input (type="number") for checkboxes was being reused as a text input
 * for the conditionally shown field. While some attributes were updated (e.g., type="text"), the class
 * attribute was not properly updated, resulting in missing styles.
 *
 * Fix:
 * Changed from using Elm's high-level attribute helpers (Attr.min, Attr.max, class) to using the lower-level
 * attribute function consistently. This ensures proper attribute handling during virtual DOM reconciliation
 * and prevents attributes from being incorrectly preserved or dropped when DOM nodes are reused.
 *
 * Example of the fix:
 * Before: class "tff-visually-hidden"
 * After:  attribute "class" "tff-visually-hidden"
 */
test('virtual-dom bug test', async ({ page, browserName }) => {
	// Set a desktop viewport
	await page.setViewportSize({ width: 2048, height: 800 });

	// Visit the form URL with predefined fields
	await page.goto(
		'http://localhost:8000/?#viewMode=CollectData&formFields=%5B%7B%22label%22%3A%22Single-line%20free%20text%20question%202%22%2C%22presence%22%3A%22Required%22%2C%22type%22%3A%7B%22type%22%3A%22ShortText%22%2C%22inputType%22%3A%22Single-line%20free%20text%22%2C%22attributes%22%3A%7B%22type%22%3A%22text%22%7D%7D%2C%22visibilityRule%22%3A%5B%5D%7D%2C%7B%22label%22%3A%22Radio%20buttons%20question%201%22%2C%22presence%22%3A%22Required%22%2C%22type%22%3A%7B%22type%22%3A%22ChooseOne%22%2C%22choices%22%3A%5B%22Yes%22%2C%22No%22%5D%7D%2C%22visibilityRule%22%3A%5B%5D%7D%2C%7B%22label%22%3A%22Single-line%20free%20text%20question%203%22%2C%22presence%22%3A%22Required%22%2C%22type%22%3A%7B%22type%22%3A%22ShortText%22%2C%22inputType%22%3A%22Single-line%20free%20text%22%2C%22attributes%22%3A%7B%22type%22%3A%22text%22%7D%7D%2C%22visibilityRule%22%3A%5B%7B%22type%22%3A%22ShowWhen%22%2C%22conditions%22%3A%5B%7B%22type%22%3A%22Field%22%2C%22fieldName%22%3A%22Radio%20buttons%20question%201%22%2C%22comparison%22%3A%7B%22type%22%3A%22Equals%22%2C%22value%22%3A%22Yes%22%7D%7D%5D%7D%5D%7D%2C%7B%22label%22%3A%22Checkboxes%20question%204%22%2C%22presence%22%3A%22Optional%22%2C%22type%22%3A%7B%22type%22%3A%22ChooseMultiple%22%2C%22choices%22%3A%5B%22Apple%22%2C%22Banana%22%2C%22Cantaloupe%22%2C%22Durian%22%5D%2C%22minRequired%22%3A2%2C%22maxAllowed%22%3A3%7D%2C%22visibilityRule%22%3A%5B%5D%7D%5D&_url=https%3A%2F%2Fhttpbin.org%2Fpost'
	);

	// Wait for page to load
	await page.waitForLoadState('networkidle');

	// Click on "Yes" radio button
	if (browserName === 'firefox') {
		// For Firefox, locate the radio by value then click its parent element
		const radioButton = page.locator('input[type="radio"][value="Yes"]');
		await radioButton.evaluate((node) => node.parentElement?.click());
	} else {
		// Use label-based selector for other browsers
		await page.getByLabel('Yes', { exact: true }).click();
	}

	// Add a wait to observe any effects after clicking
	await page.waitForTimeout(500);

	// Get CSS class for first input field
	const firstInputClass = await page
		.locator('input[name="Single-line free text question 2"]')
		.evaluate((element) => element.className);

	// Get CSS class for third input field that appears after clicking "Yes"
	const thirdInputClass = await page
		.locator('input[name="Single-line free text question 3"]')
		.evaluate((element) => element.className);

	// Assert that both inputs have the same CSS class
	expect(thirdInputClass).toBe(firstInputClass);
});
