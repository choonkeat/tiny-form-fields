import { test, expect } from "@playwright/test";

function randomOne(items) {
  return items[Math.floor((Math.random() * items.length))];
}

function randomFew(items) {
  return items.filter(() => Math.random() > 0.5);
}

const sports = ["Basketball", "Football", "Soccer", "Tennis", "Golf", "Cricket", "Rugby", "Hockey", "Baseball", "Volleyball", "Table Tennis", "Badminton", "Swimming", "Cycling", "Running", "Boxing", "MMA", "Wrestling", "Karate", "Judo", "Taekwondo", "Fencing", "Archery", "Shooting", "Skiing", "Snowboarding", "Skating", "Surfing", "Sailing", "Rowing", "Canoeing", "Kayaking", "Diving", "Gymnastics", "Weightlifting", "Powerlifting", "Bodybuilding", "Crossfit", "Yoga", "Pilates", "Dance", "Ballet", "Tap Dance", "Jazz Dance", "Hip Hop Dance", "Break Dance", "Ballroom Dance", "Latin Dance", "Salsa", "Bachata", "Merengue", "Tango", "Flamenco", "Belly Dance", "Swing Dance", "Country Dance", "Line Dance", "Square Dance", "Folk Dance", "Irish Dance", "Scottish Dance"]

test("test", async ({ page }) => {
  // Set a desktop viewport
  await page.setViewportSize({ width: 2048, height: 800 });
  await page.goto("http://localhost:8000/");

  const inputs = [
    { link: "Dropdown", label: "First dropdown", description: "first dropdown description", choices: ["Yellow", "Blue"], value: randomOne(["Yellow", "Blue"]) },
    { link: "Radio buttons", label: "Yes or no", description: "boolean", choices: ["No", "Yes", "Maybe"], value: randomOne(["No", "Yes", "Maybe"]) },
    { link: "Checkboxes", label: "Hobbies", description: "sports", choices: sports, values: randomFew(sports) },
    { link: "Multi-line description", label: "Any comments", description: "say something", maxlength: 100, value: `Sed ${new Date().toISOString()}` },
    { link: "Single-line free text", label: "Free text", description: "anything", maxlength: 20, value: (`blah string ${Math.random()}!`).substring(0, 20) },
    { link: "Custom Element", label: "Length 9 Custom Element URL", description: "some url", maxlength: 100, value: "http://lo" },
    { link: "Email", label: "some email addr", description: "work email only", maxlength: 100, value: "email1@example.com" },
    { link: "Emails", label: "multiple emails", description: "friends", maxlength: 100, value: "email2@example.com,email3@example.com" },
    { link: "Telephone", label: "Phone number", description: "toll free", maxlength: 100, value: "62353535" },
    { link: "URL", label: "Normal url", description: "internet accessible", maxlength: 100, value: "https://tiny-form-fields.netlify.app/#viewMode=Editor&formFields=%5B%5D" },
  ];

  for (const input of inputs) {
    await page.getByRole("button", { name: input.link, exact: true }).click();
    await page.waitForTimeout(600);
    await expect(page.getByText(`${input.link} question title`)).toHaveCount(0);
    await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
    await page.waitForTimeout(600);
    await page.getByText(`${input.link} question title`).click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.type(input.label);
    if (input.description) {
      await page.getByText('Question description').last().click();
      await page.waitForTimeout(100);
      await page.keyboard.press("Tab");
      await page.keyboard.type(input.description);
    }
    if (input.maxlength) {
      await page.getByText('Limit number of characters').last().click();
      await page.waitForTimeout(100);
      await page.keyboard.press("Tab");
      await page.keyboard.type(input.maxlength.toString());
    }
    if (input.choices) {
      await page.getByPlaceholder("Enter one choice per line").last().click();
      await page.keyboard.press("ControlOrMeta+a");
      await page.keyboard.type(input.choices.join("\n"));
    }
    await page.locator(".tff-close-button").click();
  }

  await page.locator('.tff-close-button').click();
  await expect(page.locator('.tff-panel-visible:has-text("Field Settings")')).toHaveCount(0);

  const page1Promise = page.waitForEvent("popup");
  await page
    .getByRole("link", { name: "View sample Collect Data page" })
    .click();
  const page1 = await page1Promise;
  for (const input of inputs) {
    switch (input.link) {
      case "Dropdown":
        await page1.getByRole('combobox').selectOption(input.value);
        break;
      case "Radio buttons":
        await page1.getByLabel(input.value, { exact: true }).click();
        break;
      case "Checkboxes":
        for (const choice of (input.values || [])) {
          await page1.getByLabel(choice, { exact: true }).click();
        }
        break;
      default:
        await page1.getByLabel(input.label).click();
        await page.waitForTimeout(100);
        page1.keyboard.type(input.value);
        await page.waitForTimeout(100);
    }
  }

  const responsePromise = page1.waitForResponse("https://httpbin.org/post", { timeout: 30000 });
  await page1.getByRole("button", { name: "Test Submit" }).click();
  const response = await responsePromise;

  const responseBody = await response.json();
  const expectedData = inputs.reduce((acc, input) => {
    if (input.values) {
      acc[input.label] = input.values;
    } else {
      acc[input.label] = input.value.substring(0, input.maxlength || input.value.length);
    }
    return acc;
  }, {});
  expect(responseBody.form).toEqual(expectedData);
});
