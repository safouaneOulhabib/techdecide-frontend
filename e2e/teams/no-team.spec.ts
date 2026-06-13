import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/no-team.json' });

test.describe('Teams — NO_TEAM user', () => {

  test('sees "not assigned to a team" empty state', async ({ page }) => {
    await page.goto('/teams');
    await expect(page.locator('.empty-state .pi-lock')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.empty-state')).toContainText(/not assigned to a team/i);
  });

  test('New Team button NOT visible', async ({ page }) => {
    await page.goto('/teams');
    await expect(page.getByRole('button', { name: /new team/i })).not.toBeVisible();
  });

});
