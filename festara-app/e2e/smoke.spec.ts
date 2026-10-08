import { expect, test, type Page } from "@playwright/test";

// The dev-only error overlay (next-themes + React 19 script warning) is not part of the product.
test.beforeEach(({ page }) => page.addInitScript(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const s = document.createElement("style");
    s.textContent = "nextjs-portal{display:none!important}";
    document.head.append(s);
  });
}));

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("rashid@example.com");
  await page.getByLabel("Password").fill("festara123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/events");
}

for (const width of [375, 768, 1440]) {
  test(`landing has no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create your event" }).first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("signed-in shell: sidebar, overview cards, chart and members table", async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole("link", { name: "Festara, your events" })).toBeVisible();
  await page.getByRole("heading", { name: "Ayesha's Mehndi" }).click();
  await expect(page.getByText("Days to go")).toBeVisible();
  await expect(page.getByText("Guests confirmed").first()).toBeVisible();
  await expect(page.locator("[data-slot=chart]")).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toBeVisible();
});
