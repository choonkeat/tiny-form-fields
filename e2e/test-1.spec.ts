import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:8000/');

  await page.getByRole('button', { name: 'Add question' }).click();
  await page.getByRole('link', { name: 'Dropdown' }).click();
  await page.getByPlaceholder('Label').dblclick();
  await page.getByPlaceholder('Label').press('ControlOrMeta+a');
  await page.getByPlaceholder('Label').fill('First dropdown');
  await page.getByLabel('Description (optional)').click();
  await page.getByLabel('Description (optional)').fill('hello world');
  await page.getByLabel('Description (optional)').press('ControlOrMeta+a');
  await page.getByLabel('Description (optional)').fill('first dropdown description');
  await page.getByPlaceholder('Enter one choice per line').click({
    clickCount: 3
  });
  await page.getByPlaceholder('Enter one choice per line').press('ControlOrMeta+a');
  await page.getByPlaceholder('Enter one choice per line').fill('Yellow\nBlue');

  await page.getByRole('button', { name: 'Add question' }).click();
  await page.getByRole('link', { name: 'Radio buttons' }).click();
  await page.getByLabel('Radio buttons label').click({
    clickCount: 3
  });
  await page.getByLabel('Radio buttons label').fill('Yes or no');
  await page.locator('#description-1').click();
  await page.locator('#description-1').fill('boolean');
  await page.locator('#choices-1').click();
  await page.locator('#choices-1').press('ControlOrMeta+a');
  await page.locator('#choices-1').fill('No\nYes\nMaybe');

  await page.getByRole('button', { name: 'Add question' }).click();
  await page.getByRole('link', { name: 'Checkboxes' }).click();
  await page.getByLabel('Checkboxes label').click();
  await page.getByLabel('Checkboxes label').press('ControlOrMeta+a');
  await page.getByLabel('Checkboxes label').fill('Hobbies');
  await page.locator('#description-2').click();
  await page.locator('#description-2').fill('sports');
  await page.locator('#choices-2').click();
  await page.locator('#choices-2').press('ControlOrMeta+a');
  await page.locator('#choices-2').fill('Basketball\nFootball');

  await page.getByRole('button', { name: 'Add question' }).click();
  await page.getByRole('link', { name: 'Multi-line description' }).click();
  await page.getByLabel('Multi-line description label').click({
    clickCount: 3
  });
  await page.getByLabel('Multi-line description label').fill('Any comments');
  await page.locator('#description-3').click();
  await page.locator('#description-3').fill('say something');
  await page.getByLabel('Max length (optional)').dblclick();
  await page.getByLabel('Max length (optional)').press('ControlOrMeta+a');
  await page.getByLabel('Max length (optional)').fill('250');

  await page.getByRole('button', { name: 'Add question' }).click();
  await page.getByRole('link', { name: 'Single-line free text' }).click();
  await page.getByLabel('Single-line free text label').click();
  await page.getByLabel('Single-line free text label').press('ControlOrMeta+a');
  await page.getByLabel('Single-line free text label').fill('Free text');
  await page.locator('#description-4').click();
  await page.locator('#description-4').fill('anything');
  await page.locator('#maxlength-4').click();
  await page.locator('#maxlength-4').fill('100');

  await page.getByRole('button', { name: 'Add question' }).click();
  await page.getByRole('link', { name: 'Email', exact: true }).click();
  await page.getByLabel('Email label').click();
  await page.getByLabel('Email label').press('ControlOrMeta+a');
  await page.getByLabel('Email label').fill('Your email');
  await page.locator('#description-5').click();
  await page.locator('#description-5').fill('we will send you an acknowledgement');
  await page.locator('#maxlength-5').click();
  await page.locator('#maxlength-5').fill('256');

  await page.getByRole('button', { name: 'Add question' }).click();
  await page.getByRole('link', { name: 'NRIC' }).click();
  await page.getByLabel('NRIC label').click();
  await page.getByLabel('NRIC label').press('ControlOrMeta+a');
  await page.getByLabel('NRIC label').fill('Your NRIC');
  await page.locator('#description-6').click();
  await page.locator('#description-6').fill('if you have');
  await page.locator('div').filter({ hasText: /^NRIC label Required field$/ }).locator('label').nth(1).click();

  await page.getByRole('button', { name: 'Add question' }).click();
  await page.getByRole('link', { name: 'URL' }).click();
  await page.getByLabel('URL label').click();
  await page.getByLabel('URL label').press('ControlOrMeta+a');
  await page.getByLabel('URL label').fill('Website');
  await page.locator('#description-7').click();
  await page.locator('#description-7').fill('a url');
  await page.locator('#maxlength-7').click();
  await page.locator('#maxlength-7').fill('256');

  await page.getByRole('button', { name: 'Add question' }).click();
  await page.getByRole('link', { name: 'Emails', exact: true }).click();
  await page.getByLabel('Emails label').click();
  await page.getByLabel('Emails label').press('ControlOrMeta+a');
  await page.getByLabel('Emails label').fill('CC Emails');
  await page.locator('#description-8').click();
  await page.locator('#description-8').fill('we will send a cc to these emails');
  await page.locator('#maxlength-8').click();
  await page.locator('#maxlength-8').fill('256');

  await page.getByRole('button', { name: 'Add question' }).click();
  await page.getByRole('link', { name: 'Custom Element' }).click();
  await page.getByLabel('Custom Element label').click();
  await page.getByLabel('Custom Element label').press('ControlOrMeta+a');
  await page.getByLabel('Custom Element label').fill('Length 9 Custom Element URL');

  await page.getByRole('button', { name: 'Preview' }).click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'View sample Collect Data page' }).click();
  const page1 = await page1Promise;
  await page1.getByRole('combobox').selectOption('Blue');
  await page1.getByText('No', { exact: true }).click();
  await page1.waitForTimeout(500);
  await expect(page1.getByText('No', { exact: true })).toBeChecked();
  await page1.getByText('Yes', { exact: true }).click();
  await page1.waitForTimeout(500);
  await expect(page1.getByText('Yes', { exact: true })).toBeChecked();
  await page1.getByText('Maybe').click();
  await page1.waitForTimeout(500);
  await expect(page1.getByText('Maybe')).toBeChecked();
  await page1.getByText('Basketball').click();
  await page1.waitForTimeout(500);
  await expect(page1.getByText('Basketball')).toBeChecked();
  await page1.getByText('Football').click();
  await page1.waitForTimeout(500);
  await expect(page1.getByText('Football')).toBeChecked();

  const inputData = {
    "Any comments": `Sed ${new Date().toISOString()}`,
    "First dropdown": "Blue",
    "Free text": `blah string ${Math.random()}!`,
    "Hobbies": [
      "Basketball",
      "Football"
    ],
    "Website": `https://example.com?${Math.random()}`,
    "Yes or no": "Maybe",
    "Your NRIC": "S0000001D",
    "Length 9 Custom Element URL": "http://ab",
    "Your email": `nobody@domain${Math.random()}.com`,
    "CC Emails": `nobody@domain${Math.random()}.com,somebody@domain${Math.random()}.com`

  }

  await page1.locator('textarea[name="Any comments"]').click();
  await page1.locator('textarea[name="Any comments"]').fill(inputData["Any comments"]);
  await page1.locator('input[name="Free text"]').click();
  await page1.locator('input[name="Free text"]').fill(inputData["Free text"]);
  await page1.locator('input[name="Your email"]').click();
  await page1.locator('input[name="Your email"]').fill(inputData["Your email"]);
  await page1.locator('input[name="Your NRIC"]').click();
  await page1.locator('input[name="Your NRIC"]').fill(inputData["Your NRIC"]);
  await page1.locator('input[name="Your NRIC"]').press('Tab');
  await page1.locator('input[name="Website"]').fill(inputData["Website"]);
  await page1.locator('input[name="CC Emails"]').click();
  await page1.locator('input[name="CC Emails"]').fill(inputData["CC Emails"]);

  await page1.locator('input[name="Length 9 Custom Element URL"]').click();
  await page1.locator('input[name="Length 9 Custom Element URL"]').fill('');
  expect(await page1.$('input[name="Length 9 Custom Element URL"]:invalid')).not.toBeNull();
  await page1.locator('input[name="Length 9 Custom Element URL"]').fill('12345678');
  expect(await page1.$('input[name="Length 9 Custom Element URL"]:invalid')).not.toBeNull();
  await page1.locator('input[name="Length 9 Custom Element URL"]').fill('123456789');
  expect(await page1.$('input[name="Length 9 Custom Element URL"]:invalid')).not.toBeNull();
  await page1.locator('input[name="Length 9 Custom Element URL"]').fill(inputData["Length 9 Custom Element URL"]);
  expect(await page1.$('input[name="Length 9 Custom Element URL"]:invalid')).toBeNull();

  const responsePromise = page1.waitForResponse('https://httpbin.org/post');
  await page1.getByRole('button', { name: 'Test Submit' }).click();
  const response = await responsePromise;

  const responseBody = await response.json();
  expect(responseBody.form).toEqual(inputData);
});
