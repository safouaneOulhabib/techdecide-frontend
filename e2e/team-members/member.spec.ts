import { test, expect } from '@playwright/test';

test.describe('Member / No-team — team members access', () => {

  test('backend-member: redirected away from own team page', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/backend-member.json' });
    await page.goto('/teams/1/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });

  test('backend-member: redirected away from other team page', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/backend-member.json' });
    await page.goto('/teams/2/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });

  test('no-team: redirected away from any team page', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/no-team.json' });
    await page.goto('/teams/1/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });

});
