import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/backend-member.json' });

test.describe('Organizations — MEMBER1 (read-only)', () => {

  test('can view organizations list', async ({ page }) => {
    await page.goto('/organizations');
    await expect(page).not.toHaveURL(/login/);
    await page.locator('p-table tbody tr').first().waitFor({ state: 'visible', timeout: 8000 });
  });

  test('New Organization button NOT visible', async ({ page }) => {
    await page.goto('/organizations');
    await expect(page.getByRole('button', { name: /new organization/i })).not.toBeVisible();
  });

  test('delete buttons NOT visible on org rows', async ({ page }) => {
    await page.goto('/organizations');
    await page.locator('p-table tbody tr').first().waitFor({ state: 'visible', timeout: 8000 });
    await expect(page.locator('.btn-delete').first()).not.toBeVisible();
  });

});
