import { test, expect } from '@playwright/test';

test('sidebar shows appRole for current user', async ({ page }) => {
  await page.goto('/decisions');
  await expect(page).not.toHaveURL(/login/);
  await expect(page.locator('.sidebar .user-role')).toBeVisible();
});

test('logout clears session and redirects to login', async ({ page }) => {
  await page.goto('/decisions');
  // Avatar in the navbar opens the PrimeNG profile popup menu
  await page.locator('header .user-avatar').click();
  await page.getByText('Logout').click();
  await expect(page).toHaveURL(/auth\/login/, { timeout: 5000 });
  // Navigating to a protected route should redirect back to login
  await page.goto('/decisions');
  await expect(page).toHaveURL(/auth\/login/);
});
