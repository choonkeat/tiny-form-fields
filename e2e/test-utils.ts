import { Page } from "@playwright/test";

export interface FieldEdit {
    label: string;
    value?: string;
    description?: string;
    maxlength?: number;
    choices?: string[];
    visibilityRule?: {
        type: "Show  this question when" | "Hide  this question when";
        field: string;
        comparison: {
            type: "equals" | "contains" | "choice includes" | "endsWith";
            value: string;
        };
    };
}

export async function addField(
    page: Page,
    fieldType: string,
    edits: FieldEdit[],
) {
    await page.getByRole("button", { name: fieldType, exact: true }).click();
    await page.waitForTimeout(100);

    for (const edit of edits) {
        await page
            .locator(".tff-field-container .tff-drag-handle-icon")
            .last()
            .click();
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

        if (edit.visibilityRule) {
            await page.getByText("Field logic").click();
            await page.waitForTimeout(100);
            await page.selectOption(
                "select.tff-show-or-hide",
                edit.visibilityRule.type,
            );
            await page.selectOption(
                "select.tff-question-title",
                edit.visibilityRule.field,
            );
            await page.selectOption(
                "select.tff-comparison-type",
                edit.visibilityRule.comparison.type,
            );
            await page.locator(".tff-comparison-value").click();
            await page.keyboard.press("ControlOrMeta+a");
            await page.keyboard.type(edit.visibilityRule.comparison.value);
        }
    }
    await page.locator(".tff-close-button").click();
}
