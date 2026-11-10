import { expect, test } from "@playwright/test";

test("on a phone, a step can be added and configured from the list", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Phone layout only");
  await page.goto("/app/workflows/wf_reviews");
  await expect(page.getByRole("button", { name: /^Trigger/ })).toBeVisible();

  const before = await page
    .getByRole("button", {
      name: /^(Spreadsheet|SMS|Delay|Filter|Set fields)/,
    })
    .count();
  await page.getByRole("button", { name: "Add a step here" }).first().click();
  await page.getByRole("button", { name: /Post message/ }).click();

  const dialog = page.getByRole("dialog", { name: "Step" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox", { name: "Channel" }).click();
  await page.getByRole("option", { name: "#ops" }).click();
  await dialog
    .getByRole("combobox", { name: "Message" })
    .fill("Paid: {{trigger.client_name}}");
  await expect(dialog.getByText(/Preview: Paid: /)).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).click();

  await expect(page.getByRole("button", { name: /^Team chat/ })).toBeVisible();
  expect(
    await page
      .getByRole("button", {
        name: /^(Spreadsheet|SMS|Delay|Filter|Set fields)/,
      })
      .count(),
  ).toBe(before);
});
