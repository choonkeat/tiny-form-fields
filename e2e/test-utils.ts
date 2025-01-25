import { Page, expect } from "@playwright/test";

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
    type: "Show this question when" | "Hide this question when";
    field: string;
    comparison: Comparison[];
}

export interface Comparison {
    type: "Equals" | "StringContains" | "EndsWith" | "GreaterThan";
    value: string;
}

export async function addField(
    page: Page,
    fieldType: string,
    edits?: FieldEdit[],
    input?: FieldInput,
) {
    await page.getByRole("button", { name: fieldType, exact: true }).click();
    await page.waitForTimeout(600);
    await expect(page.getByText(`${fieldType} question title`)).toHaveCount(0);
    await page.locator('.tff-field-container .tff-drag-handle-icon').last().click();
    await page.waitForTimeout(600);
    await page.getByText(`${fieldType} question title`).click();

    if (input) {
        // Handle test-1.spec.ts style input
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
    } else if (edits) {
        // Handle visibility.spec.ts style edits
        for (const edit of edits) {
            if (edit.label === "Question description" || edit.label === "Limit number of characters") {
                await page.getByText(edit.label).last().click();
                await page.waitForTimeout(100);
                await page.keyboard.press("Tab");
            } else {
                await page.getByText(edit.label).click();
            }
            if (edit.value) {
                await page.keyboard.press("ControlOrMeta+a");
                await page.keyboard.type(edit.value);
            }

            if (edit.visibilityRule) {
                for (const rule of edit.visibilityRule) {
                    await page.getByRole("button", { name: "Add field logic" }).click();
                    await page.waitForTimeout(100);
                    
                    // Get the last field rule section
                    const lastFieldRule = page.locator('.tff-field-rule').last();
                    await lastFieldRule.locator('.tff-show-or-hide').selectOption(rule.type === 'Show this question when' ? 'ShowWhen' : 'HideWhen');
                    await lastFieldRule.locator('.tff-question-title').selectOption(rule.field);

                    for (const comparison of rule.comparison) {
                        if (comparison !== rule.comparison[0]) {
                            // For subsequent comparisons, click "Add condition"
                            await page.getByRole("button", { name: "Add condition" }).click();
                            await page.waitForTimeout(100);
                        }
                        // Get the last condition group
                        await lastFieldRule.locator('.tff-comparison-type').last().selectOption(comparison.type);
                        await lastFieldRule.locator('.tff-comparison-value').last().click();
                        await page.keyboard.type(comparison.value);
                    }
                }
            }
        }
    }

    await page.locator(".tff-close-button").click();
}
