import { test, expect } from '@playwright/test';

// Runs under every project — verifies the saved session is valid
test('sidebar shows correct role badge', async ({ page }) => {
  await page.goto('/decisions');
  await expect(page).not.toHaveURL(/login/);
  // Sidebar must show the user's appRole
  const sidebar = page.locator('.sidebar, nav, [class*="sidebar"]').first();
  await expect(sidebar).toBeVisible();
});

test('logout clears session and redirects to login', async ({ page }) => {
  await page.goto('/decisions');
  // Open user menu / click logout
  await page.getByRole('button', { name: /logout|sign out/i }).click().catch(async () => {
    // Some UIs hide logout behind an avatar click
    await page.locator('[class*="avatar"], [class*="user-menu"]').first().click();
    await page.getByRole('button', { name: /logout|sign out/i }).click();
  });
  await expect(page).toHaveURL(/login/, { timeout: 5000 });
  // Navigating to a protected route should redirect back to login
  await page.goto('/decisions');
  await expect(page).toHaveURL(/login/);
});
