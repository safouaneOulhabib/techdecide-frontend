import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/backend-member.json' });

test.describe('Teams — MEMBER1 (team-scoped view)', () => {

  test('can view teams list showing own team', async ({ page }) => {
    await page.goto('/teams');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('text=Backend Team')).toBeVisible({ timeout: 8000 });
  });

  test('New Team button NOT visible', async ({ page }) => {
    await page.goto('/teams');
    await expect(page.getByRole('button', { name: /new team/i })).not.toBeVisible();
  });

  test('delete button NOT visible on team rows', async ({ page }) => {
    await page.goto('/teams');
    await page.locator('p-table tbody tr').first().waitFor({ state: 'visible', timeout: 8000 });
    await expect(page.locator('.btn-delete').first()).not.toBeVisible();
  });

  test('btn-members visible (can navigate to team members page)', async ({ page }) => {
    await page.goto('/teams');
    await page.locator('p-table tbody tr').first().waitFor({ state: 'visible', timeout: 8000 });
    await expect(page.locator('.btn-members').first()).toBeVisible();
  });

});
