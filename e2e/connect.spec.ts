import { test, expect } from "@playwright/test";

test.describe("JAW connect flow", () => {
  test("server-renders the hero and shows the connect button", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /jaw as default sign in/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /connect wallet/i }),
    ).toBeVisible();
  });

  test("opens the modal with JAW pinned as the primary Sign In", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /connect wallet/i }).click();

    const dialog = page.getByRole("dialog", { name: /connect a wallet/i });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: /sign in with jaw/i }),
    ).toBeVisible();
    // A headless browser has no wallet extensions → EIP-6963 discovers none.
    await expect(
      dialog.getByRole("button", { name: /no browser wallets detected/i }),
    ).toBeVisible();
  });

  test("traps focus inside the modal and restores it on close", async ({
    page,
  }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /connect wallet/i });
    await trigger.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Tab repeatedly — focus must never leave the dialog (real layout, so the
    // offsetParent-based focusable filter actually works here, unlike jsdom).
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      await expect
        .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
        .toBe(true);
    }

    // Escape closes the modal and returns focus to the trigger.
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
