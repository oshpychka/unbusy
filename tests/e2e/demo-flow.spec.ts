import { expect, test } from "@playwright/test";

test("a playbook opens in the demo, runs a test and can be debugged", async ({
  page,
  isMobile,
}) => {
  await page.goto("/playbooks/chase-unpaid-invoices");
  await page.getByRole("link", { name: "Open in the demo" }).click();
  await expect(page).toHaveURL(/\/app\/workflows\/wf_/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Chase unpaid invoices" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Test run" }).first().click();
  await page.getByRole("textbox", { name: "Sample trigger data" }).fill(
    JSON.stringify({
      number: "INV-1",
      client_name: "Harbor Dental Group",
      client_email: "billing@harbordental.example",
      client_phone: "(206) 555-0118",
      amount: 900,
      due_date: "2026-09-01",
      days_overdue: 45,
      reminders_sent: 2,
    }),
  );
  await page.getByRole("button", { name: "Run test" }).click();
  if (isMobile) await page.getByRole("button", { name: "Details" }).click();
  await expect(page.getByText("Succeeded").first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: /More than 30 days late\?\s*Yes/ }),
  ).toBeVisible();

  await page.goto("/app/runs?status=failed");
  await page.locator("tbody a").first().click();
  const scrubber = page.getByRole("slider", { name: "Step in this run" });
  await expect(scrubber).toBeVisible();
  await scrubber.focus();
  await page.keyboard.press("Home");
  await expect(page.getByText("Step 1 of")).toBeVisible();
  await expect(
    page
      .getByText("Emails and phone numbers are hidden")
      .or(page.getByRole("heading", { level: 2 }).first()),
  ).toBeVisible();
});
