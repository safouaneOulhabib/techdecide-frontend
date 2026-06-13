import { test, expect } from '@playwright/test';

test.describe('backend-member: team members access', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });

  test('redirected away from own team page', async ({ page }) => {
    await page.goto('/teams/1/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });

  test('redirected away from other team page', async ({ page }) => {
    await page.goto('/teams/2/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });
});

test.describe('no-team user: team members access', () => {
  test.use({ storageState: 'e2e/.auth/no-team.json' });

  test('redirected away from any team page', async ({ page }) => {
    await page.goto('/teams/1/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });
});
