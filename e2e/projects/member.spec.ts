import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/backend-member.json' });

test.describe('Projects — MEMBER (read-only)', () => {

  test('can view the projects list page', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('h2')).toBeVisible({ timeout: 5000 });
  });

  test('Create Project button is NOT visible for non-APP_ADMIN', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('button', { name: /new project/i })).not.toBeVisible({ timeout: 5000 });
  });

  test('can see projects their team is assigned to (GTN)', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('tr').filter({ hasText: /GTN/i })).toBeVisible({ timeout: 8000 });
  });

  test('can navigate to project detail', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    const row = page.locator('tr').filter({ hasText: /GTN/i }).first();
    await row.waitFor({ state: 'visible', timeout: 8000 });
    await row.locator('button.btn-view').click();
    await page.waitForURL(/\/projects\/\d+/, { timeout: 8000 });
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
  });

  test('project detail has no assign-team or remove-team buttons', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    const row = page.locator('tr').filter({ hasText: /GTN/i }).first();
    await row.waitFor({ state: 'visible', timeout: 8000 });
    await row.locator('button.btn-view').click();
    await page.waitForURL(/\/projects\/\d+/, { timeout: 8000 });
    await expect(page.getByRole('button', { name: /assign team|add team|remove/i })).not.toBeVisible();
  });

});
