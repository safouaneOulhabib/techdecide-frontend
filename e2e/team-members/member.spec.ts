import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/backend-member.json' });

test.describe('Team Members — MEMBER1 (read-only)', () => {

  test('can view own team (Backend) members page', async ({ page }) => {
    await page.goto('/teams/1/members');
    await expect(page).not.toHaveURL(/login|decisions$/);
    await expect(page.locator('text=Team Members')).toBeVisible({ timeout: 5000 });
  });

  test('role shown as badge (no dropdown for MEMBER)', async ({ page }) => {
    await page.goto('/teams/1/members');
    await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });
    // No p-select role dropdown — only role-badge text
    await expect(page.locator('tbody tr').first().locator('p-select')).not.toBeVisible();
    await expect(page.locator('tbody tr').first().locator('.role-badge')).toBeVisible();
  });

  test('no remove button visible (MEMBER is read-only)', async ({ page }) => {
    await page.goto('/teams/1/members');
    await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });
    await expect(page.locator('tbody tr button:has(.pi-trash)')).not.toBeVisible();
  });

  test('redirected from Devops team members page', async ({ page }) => {
    await page.goto('/teams/2/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });

});
