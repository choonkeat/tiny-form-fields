import { Page } from '@playwright/test';

export interface FieldEdit {
    label: string;
    value?: string;
    description?: string;
    maxlength?: number;
    choices?: string[];
}

export async function addField(page: Page, fieldType: string, edits: FieldEdit[]) {
    await page.getByRole("button", { name: fieldType, exact: true }).click();
    await page.waitForTimeout(100);

    for (const edit of edits) {
        await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
        await page.waitForTimeout(100);
        await page.getByText(edit.label).click();
        switch (edit.label) {
            case "Question description":
            case "Limit number of characters":
                await page.waitForTimeout(100);
                await page.keyboard.press("Tab");
                break;
        }
        await page.keyboard.press("ControlOrMeta+a");
        if (edit.value) {
            await page.keyboard.type(edit.value);
        }
    }
    await page.locator(".tff-close-button").click();
}
