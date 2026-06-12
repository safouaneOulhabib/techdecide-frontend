import { test, expect } from '@playwright/test';

// Runs for backend-member and no-team (both are MEMBER-level users)
test.describe('Member — decisions', () => {

  test('can view decision list', async ({ page }) => {
    await page.goto('/decisions');
    await expect(page).not.toHaveURL(/login/);
  });

  test('status selector is NOT visible', async ({ page }) => {
    await page.goto('/decisions');
    // Open first decision
    await page.locator('[class*="decision-card"], tr').first().click();
    await page.waitForURL(/decisions\/\d+/);
    // No status change control
    await expect(page.getByRole('combobox').filter({ hasText: /draft|proposed/i })).not.toBeVisible();
  });

  test('edit and delete buttons are NOT visible on other users decisions', async ({ page }) => {
    await page.goto('/decisions');
    await page.locator('[class*="decision-card"], tr').first().click();
    await page.waitForURL(/decisions\/\d+/);
    await expect(page.getByRole('button', { name: /^edit$/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /^delete$/i })).not.toBeVisible();
  });

  test('can comment on a decision', async ({ page }) => {
    await page.goto('/decisions');
    await page.locator('[class*="decision-card"], tr').first().click();
    await page.waitForURL(/decisions\/\d+/);
    const commentInput = page.getByPlaceholder(/comment|write/i);
    if (await commentInput.isVisible()) {
      await commentInput.fill('Automated test comment');
      await page.getByRole('button', { name: /post|submit|send/i }).click();
      await expect(page.locator('text=Automated test comment')).toBeVisible({ timeout: 5000 });
    }
  });

});
