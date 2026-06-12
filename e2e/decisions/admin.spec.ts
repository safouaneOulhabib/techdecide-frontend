import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/admin.json' });

test.describe('Admin — decisions', () => {

  test('APP_ADMIN badge shown in sidebar', async ({ page }) => {
    await page.goto('/decisions');
    await expect(page.locator('.sidebar .user-role')).toHaveText('APP_ADMIN');
  });

  test('can create a decision', async ({ page }) => {
    await page.goto('/decisions');
    await page.getByRole('button', { name: /new decision/i }).click();
    await page.getByLabel(/title/i).fill('E2E Admin Decision');
    await page.getByLabel(/context/i).fill('E2E context');
    await page.getByLabel(/decision/i).first().fill('E2E decision body');
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    await page.waitForURL(/decisions\/\d+/);
    await expect(page.locator('text=E2E Admin Decision')).toBeVisible();
  });

  test('edit button visible on DRAFT, hidden on APPROVED', async ({ page }) => {
    await page.goto('/decisions');
    await page.getByRole('button', { name: /new decision/i }).click();
    await page.getByLabel(/title/i).fill('E2E Edit Guard');
    await page.getByLabel(/context/i).fill('ctx');
    await page.getByLabel(/decision/i).first().fill('dec');
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    await page.waitForURL(/decisions\/\d+/);

    // Edit visible on DRAFT
    await expect(page.locator('.btn-edit')).toBeVisible();

    // Advance to APPROVED via PrimeNG p-select (appendTo body → .p-select-option)
    await page.locator('.status-selector p-select').click();
    await page.locator('.p-select-option').filter({ hasText: /PROPOSED/i }).click();
    await page.waitForTimeout(300);
    await page.locator('.status-selector p-select').click();
    await page.locator('.p-select-option').filter({ hasText: /APPROVED/i }).click();
    await page.waitForTimeout(300);

    // Edit hidden on APPROVED
    await expect(page.locator('.btn-edit')).not.toBeVisible();
  });

  test('can delete a DRAFT decision', async ({ page }) => {
    await page.goto('/decisions');
    await page.getByRole('button', { name: /new decision/i }).click();
    await page.getByLabel(/title/i).fill('E2E Delete Me');
    await page.getByLabel(/context/i).fill('ctx');
    await page.getByLabel(/decision/i).first().fill('dec');
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    await page.waitForURL(/decisions\/\d+/);
    await page.locator('.btn-delete, [class*="btn-delete"]').click();
    const confirm = page.getByRole('button', { name: /confirm|yes|ok/i });
    if (await confirm.isVisible({ timeout: 1000 }).catch(() => false)) await confirm.click();
    await expect(page).toHaveURL(/decisions$/, { timeout: 5000 });
  });

  test('status selector visible and functional', async ({ page }) => {
    await page.goto('/decisions');
    await page.getByRole('button', { name: /new decision/i }).click();
    await page.getByLabel(/title/i).fill('E2E Status Flow');
    await page.getByLabel(/context/i).fill('ctx');
    await page.getByLabel(/decision/i).first().fill('dec');
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    await page.waitForURL(/decisions\/\d+/);
    const statusSelector = page.locator('.status-selector');
    await expect(statusSelector).toBeVisible();
    // Open the p-select and pick PROPOSED
    await statusSelector.locator('p-select').click();
    await page.locator('.p-select-option').filter({ hasText: /PROPOSED/i }).click();
    await expect(page.locator('.decision-status-badge, [class*="status"]').filter({ hasText: /PROPOSED/i })).toBeVisible({ timeout: 3000 });
  });

});
