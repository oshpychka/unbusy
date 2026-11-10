import { expect, test } from "@playwright/test";

test("the skip link is the first stop and moves focus to the content", async ({
  page,
}) => {
  await page.goto("/pricing");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("the command palette opens and closes from the keyboard", async ({
  page,
}) => {
  await page.goto("/app/workflows");
  await expect(
    page.getByRole("heading", { level: 1, name: "Workflows" }),
  ).toBeVisible();
  await page.keyboard.press("ControlOrMeta+k");
  const input = page.getByPlaceholder("Search pages, workflows, playbooks");
  await expect(input).toBeFocused();
  await input.fill("analytics");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/app\/analytics$/);
});

test("the mobile menu traps focus and returns it on Escape", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Phone layout only");
  await page.goto("/");
  const button = page.getByRole("button", { name: "Open menu" });
  await button.click();
  await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  await expect(button).toBeFocused();
});

test("editor shortcuts delete and restore a step", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Keyboard shortcuts are for desktop");
  await page.goto("/app/workflows/wf_invoices");
  const step = page.getByRole("button", { name: /^Spreadsheet/ });
  await step.click();
  await page.keyboard.press("Delete");
  await expect(step).toHaveCount(0);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(step).toHaveCount(1);
});
