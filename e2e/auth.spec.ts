import { test, expect } from '@playwright/test';

test.describe('Auth — unauthenticated flows', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('register new user → success and redirect to /decisions', async ({ page }) => {
    const uid = Date.now();
    await page.goto('/auth/register');
    await page.locator('#name').fill(`E2E User ${uid}`);
    await page.locator('#email').fill(`e2e.${uid}@test.com`);
    await page.locator('p-password input').fill('Test1234!');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL(/decisions/, { timeout: 10000 });
  });

  test('login valid credentials → redirected to /decisions', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('#email').fill('member.backend@techdecide.com');
    await page.locator('p-password input').fill('Test1234!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/decisions/, { timeout: 8000 });
  });

  test('login wrong password → error message shown', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('#email').fill('member.backend@techdecide.com');
    await page.locator('p-password input').fill('WrongPass!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('p-message')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Auth — authenticated redirect', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });

  test('authenticated user visits /auth/login → redirected to /decisions', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });
});

test.describe('Auth — logout', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });

  test('logout clears session and redirects to login', async ({ page }) => {
    await page.goto('/decisions');
    await page.locator('header .user-avatar').click();
    await page.getByText('Logout').click();
    await expect(page).toHaveURL(/auth\/login/, { timeout: 5000 });
    await page.goto('/decisions');
    await expect(page).toHaveURL(/auth\/login/);
  });
});
