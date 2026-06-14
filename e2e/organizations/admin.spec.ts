import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/admin.json' });

test.describe('Organizations — APP_ADMIN', () => {

  test('can view organizations list', async ({ page }) => {
    await page.goto('/organizations');
    await expect(page).not.toHaveURL(/login/);
  });

  test('New Organization button visible', async ({ page }) => {
    await page.goto('/organizations');
    await expect(page.getByRole('button', { name: /new organization/i })).toBeVisible({ timeout: 5000 });
  });

  test('can create and delete an organization', async ({ page }) => {
    const uid = Date.now();
    const name = `E2E Org ${uid}`;
    await page.goto('/organizations');
    await page.getByRole('button', { name: /new organization/i }).click();
    await page.locator('#orgName').fill(name);
    await page.locator('.p-dialog-footer').getByRole('button', { name: /create/i }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 5000 });
    // Delete
    const row = page.locator('p-table tbody tr').filter({ hasText: name });
    await row.locator('.btn-delete').click();
    await page.getByRole('button', { name: /delete|confirm|yes|ok/i }).click({ timeout: 3000 }).catch(() => null);
    await expect(page.locator(`text=${name}`)).not.toBeVisible({ timeout: 5000 });
  });

  test('delete buttons visible on org rows', async ({ page }) => {
    await page.goto('/organizations');
    await page.locator('p-table tbody tr').first().waitFor({ state: 'visible', timeout: 8000 });
    await expect(page.locator('.btn-delete').first()).toBeVisible();
  });

});
