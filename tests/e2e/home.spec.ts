import { expect, test } from "@playwright/test";

test("live hero takes the other branch when the invoice is less late", async ({
  page,
}) => {
  await page.goto("/");
  const log = page.locator("#hero-log");
  await expect(log).toContainText("More than 30 days late? Yes");

  await page.locator("#hero-days").fill("10");
  await expect(log).toContainText("More than 30 days late? No");
  await expect(log).toContainText("Friendly reminder: done");
});

test("sentence builder estimates the time and links to the calculator", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("How many invoices").fill("20");
  await expect(page.getByText("17 h", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Add more tasks" }).click();
  await expect(page).toHaveURL(
    /savings-calculator\?t=chase-unpaid-invoices%3A20%3Aweek%3A12|savings-calculator\?t=chase-unpaid-invoices:20:week:12/,
  );
  await expect(page.getByLabel("Times").first()).toHaveValue("20");
});
