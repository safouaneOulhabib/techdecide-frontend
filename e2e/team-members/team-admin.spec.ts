import { test, expect } from '@playwright/test';

test.describe('backend-admin: team members access', () => {
  test.use({ storageState: 'e2e/.auth/backend-admin.json' });

  test('can access own team page', async ({ page }) => {
    await page.goto('/teams/1/members');
    await expect(page).not.toHaveURL(/login|decisions$/);
    await expect(page.locator('text=Team Members')).toBeVisible();
  });

  test('redirected away from Devops team page', async ({ page }) => {
    await page.goto('/teams/2/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });
});

test.describe('devops-admin: team members access', () => {
  test.use({ storageState: 'e2e/.auth/devops-admin.json' });

  test('can access own team page', async ({ page }) => {
    await page.goto('/teams/2/members');
    await expect(page).not.toHaveURL(/login|decisions$/);
    await expect(page.locator('text=Team Members')).toBeVisible();
  });

  test('redirected away from Backend team page', async ({ page }) => {
    await page.goto('/teams/1/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });
});
