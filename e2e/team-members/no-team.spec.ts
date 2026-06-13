import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/no-team.json' });

test.describe('Team Members — NO_TEAM user', () => {

  test('redirected from Backend team members page', async ({ page }) => {
    await page.goto('/teams/1/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });

  test('redirected from Devops team members page', async ({ page }) => {
    await page.goto('/teams/2/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });

});
