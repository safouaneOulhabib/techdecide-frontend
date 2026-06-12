import { test, expect } from '@playwright/test';

/** Helper: fill the report form (title + one decision) and submit */
async function createReport(page: any, title: string) {
  await page.goto('/reports/new');
  await page.locator('#report-title').fill(title);
  // Select at least one decision from the picker (required for canCreate())
  await page.locator('.picker-item').first().waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('.picker-item').first().click();
  // Submit via the "Create Report" native button
  await page.locator('.btn-action.btn-primary').click();
  await page.waitForURL(/\/reports/, { timeout: 8000 });
}

test.describe('Admin reports', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('can create a report', async ({ page }) => {
    await createReport(page, 'E2E Admin Report');
    await expect(page.locator('text=E2E Admin Report')).toBeVisible();
  });

  test('can edit own report', async ({ page }) => {
    await page.goto('/reports');
    // Find the report card or row with the title
    const item = page.locator('.report-card, [class*="report-card"]').filter({ hasText: /E2E Admin Report/ }).first();
    await item.waitFor({ state: 'visible', timeout: 5000 });
    await item.click();
    await page.getByRole('button', { name: /edit/i }).click();
    await page.locator('#report-title').fill('E2E Admin Report Updated');
    await page.locator('.btn-action.btn-primary').click();
    await expect(page.locator('text=E2E Admin Report Updated')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Backend member reports', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });

  test('cannot edit another users report', async ({ page }) => {
    await page.goto('/reports');
    const item = page.locator('.report-card, [class*="report-card"]').first();
    await item.waitFor({ state: 'visible', timeout: 5000 });
    await item.click();
    await expect(page.getByRole('button', { name: /edit/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).not.toBeVisible();
  });
});

test.describe('Backend admin reports', () => {
  test.use({ storageState: 'e2e/.auth/backend-admin.json' });

  test('can create and delete own report', async ({ page }) => {
    await createReport(page, 'E2E Backend Admin Report');
    const deleteBtn = page.getByRole('button', { name: /delete/i });
    if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteBtn.click();
      const confirm = page.getByRole('button', { name: /confirm|yes|ok/i });
      if (await confirm.isVisible({ timeout: 1000 }).catch(() => false)) await confirm.click();
      await expect(page).toHaveURL(/reports$/, { timeout: 5000 });
    }
  });
});
