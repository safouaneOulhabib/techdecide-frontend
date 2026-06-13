import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/no-team.json' });

test.describe('Reports — NO_TEAM user', () => {

  test('reports list shows lock empty state', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('.empty-state .pi-lock')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.empty-state')).toContainText(/not assigned to a team/i);
  });

  test('New Report button NOT visible', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByRole('button', { name: /new report/i })).not.toBeVisible();
  });

});
