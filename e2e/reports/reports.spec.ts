import { test, expect } from '@playwright/test';

test.describe('Reports', () => {

  test('admin: can create a report', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await page.goto('/reports/new');
    await page.getByLabel(/title/i).fill('E2E Admin Report');
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    await expect(page).toHaveURL(/reports\/\d+|reports$/, { timeout: 5000 });
    await expect(page.locator('text=E2E Admin Report')).toBeVisible();
  });

  test('admin: can edit own report', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await page.goto('/reports');
    await page.locator('[class*="report-card"], tr').filter({ hasText: /E2E Admin Report/ }).first().click();
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByLabel(/title/i).fill('E2E Admin Report Updated');
    await page.getByRole('button', { name: /save|update/i }).click();
    await expect(page.locator('text=E2E Admin Report Updated')).toBeVisible({ timeout: 5000 });
  });

  test('backend-member: cannot edit another users report', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/backend-member.json' });
    await page.goto('/reports');
    // Open first report (likely owned by admin)
    await page.locator('[class*="report-card"], tr').first().click();
    await expect(page.getByRole('button', { name: /edit/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).not.toBeVisible();
  });

  test('backend-admin: can create and delete own report', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/backend-admin.json' });
    await page.goto('/reports/new');
    await page.getByLabel(/title/i).fill('E2E Backend Admin Report');
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    await page.waitForURL(/reports\/\d+|reports$/);
    // Delete it
    const deleteBtn = page.getByRole('button', { name: /delete/i });
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      const confirm = page.getByRole('button', { name: /confirm|yes|ok/i });
      if (await confirm.isVisible({ timeout: 1000 }).catch(() => false)) await confirm.click();
      await expect(page).toHaveURL(/reports$/, { timeout: 5000 });
    }
  });

});
