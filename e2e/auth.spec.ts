import { test, expect } from '@playwright/test';

test.describe('Auth — critical journeys', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('AUTH-01 register new user → success and redirect to /decisions', async ({ page }) => {
    const uid = Date.now();
    await page.goto('/auth/register');
    await page.locator('#name').fill(`E2E User ${uid}`);
    await page.locator('#email').fill(`e2e.${uid}@test.com`);
    await page.locator('p-password input').fill('Test1234!');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL(/decisions/, { timeout: 10000 });
  });

  test('AUTH-05 login valid credentials → redirected to /decisions', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('#email').fill('member.backend@techdecide.com');
    await page.locator('p-password input').fill('Test1234!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/decisions/, { timeout: 8000 });
  });

  test('AUTH-06 login wrong password → error message shown', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('#email').fill('member.backend@techdecide.com');
    await page.locator('p-password input').fill('WrongPass!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('p-message')).toBeVisible({ timeout: 5000 });
  });
});
