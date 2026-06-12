import { test, expect } from '@playwright/test';

test.describe('Team Admin — team members', () => {

  test('backend-admin: can access own team page', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/backend-admin.json' });
    await page.goto('/teams/1/members');
    await expect(page).not.toHaveURL(/login|decisions$/);
    await expect(page.locator('text=Team Members')).toBeVisible();
  });

  test('backend-admin: redirected away from Devops team page', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/backend-admin.json' });
    await page.goto('/teams/2/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });

  test('devops-admin: can access own team page', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/devops-admin.json' });
    await page.goto('/teams/2/members');
    await expect(page).not.toHaveURL(/login|decisions$/);
    await expect(page.locator('text=Team Members')).toBeVisible();
  });

  test('devops-admin: redirected away from Backend team page', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/devops-admin.json' });
    await page.goto('/teams/1/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });

});
