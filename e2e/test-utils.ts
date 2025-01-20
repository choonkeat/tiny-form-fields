import { Page } from "@playwright/test";

export interface FieldEdit {
    label: string;
    value?: string;
    description?: string;
    maxlength?: number;
    choices?: string[];
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
            for (const rule of edit.visibilityRule) {
                await addFieldLogic(rule);
            }
        }
    }
    await page.locator(".tff-close-button").click();

    async function addFieldLogic(rule: VisibilityRule) {
        await page.getByRole("button", { name: "Add field logic" }).click();
        await page.waitForTimeout(100);
        await page.selectOption(
            "select.tff-show-or-hide",
            rule.type
        );
        let index = 0;
        for (const comparison of rule.comparison) {
            await page.selectOption(
                `.tff-field-rule-conditions > div:nth-child(${2 * index + 1}) select.tff-question-title`,
                JSON.stringify(rule.field)
            );
            await page.waitForTimeout(100);
            await page.selectOption(
                `.tff-field-rule-conditions > div:nth-child(${2 * index + 1}) select.tff-comparison-type`,
                comparison.type
            );
            await page.waitForTimeout(100);
            await page.locator(`.tff-comparison-value`).last().click();
            await page.keyboard.press("ControlOrMeta+a");
            await page.keyboard.type(comparison.value);

            if (comparison != rule.comparison[rule.comparison.length - 1]) {
                await page.getByRole("button", { name: "Add condition" }).click();
                await page.waitForTimeout(100);
            }
            index++;
        };
    }
}
