import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/no-team.json' });

test.describe('Decisions — NO_TEAM user', () => {

  test('decision list shows lock empty state', async ({ page }) => {
    await page.goto('/decisions');
    await expect(page.locator('.empty-state .pi-lock')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.empty-state')).toContainText(/not assigned to a team/i);
  });

  test('New Decision button NOT visible', async ({ page }) => {
    await page.goto('/decisions');
    await expect(page.getByRole('button', { name: /new decision/i })).not.toBeVisible();
  });

  test('/decisions/create redirects back to /decisions', async ({ page }) => {
    await page.goto('/decisions/create');
    await expect(page).toHaveURL(/\/decisions$/, { timeout: 5000 });
  });

});
