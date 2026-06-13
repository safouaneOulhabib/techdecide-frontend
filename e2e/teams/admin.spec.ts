import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/admin.json' });

test.describe('Teams — APP_ADMIN', () => {

  test('can view all teams (Backend + Devops)', async ({ page }) => {
    await page.goto('/teams');
    await expect(page.locator('text=Backend Team')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=Devops Team')).toBeVisible();
  });

  test('New Team button visible', async ({ page }) => {
    await page.goto('/teams');
    await expect(page.getByRole('button', { name: /new team/i })).toBeVisible({ timeout: 5000 });
  });

  test('delete buttons visible on team rows', async ({ page }) => {
    await page.goto('/teams');
    await page.locator('p-table tbody tr').first().waitFor({ state: 'visible', timeout: 8000 });
    await expect(page.locator('.btn-delete').first()).toBeVisible();
  });

  test('can create and delete a team', async ({ page }) => {
    const uid = Date.now();
    const name = `E2E Team ${uid}`;
    await page.goto('/teams');
    await page.getByRole('button', { name: /new team/i }).click();
    await page.locator('#teamName').fill(name);
    // Select first available organization
    await page.locator('#teamOrg').click();
    await page.locator('.p-select-option').first().click();
    await page.locator('.p-dialog-footer').getByRole('button', { name: /create/i }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 5000 });
    // Delete
    const row = page.locator('p-table tbody tr').filter({ hasText: name });
    await row.locator('.btn-delete').click();
    const confirm = page.getByRole('button', { name: /delete|confirm|yes|ok/i });
    if (await confirm.isVisible({ timeout: 1500 }).catch(() => false)) await confirm.click();
    await expect(page.locator(`text=${name}`)).not.toBeVisible({ timeout: 5000 });
  });

});
