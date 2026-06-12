import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/admin.json' });

test.describe('Admin — team members', () => {

  test('can access Backend Team members page', async ({ page }) => {
    await page.goto('/teams/1/members');
    await expect(page).not.toHaveURL(/login|decisions$/);
    await expect(page.locator('text=Team Members')).toBeVisible();
  });

  test('can access Devops Team members page', async ({ page }) => {
    await page.goto('/teams/2/members');
    await expect(page).not.toHaveURL(/login|decisions$/);
    await expect(page.locator('text=Team Members')).toBeVisible();
  });

  test('can add a member (noteam user) to Backend Team', async ({ page }) => {
    await page.goto('/teams/1/members');
    const select = page.locator('p-select').filter({ has: page.locator('[placeholder*="user"]') });
    await select.click();
    const option = page.locator('[class*="option"], li').filter({ hasText: /no team|noteam/i }).first();
    if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
      await option.click();
      await page.getByRole('button', { name: /assign/i }).click();
      await expect(page.locator('text=No Team')).toBeVisible({ timeout: 5000 });
      // Clean up — remove the added member
      const row = page.locator('tr').filter({ hasText: /no team|noteam/i });
      await row.getByRole('button').click();
      const confirm = page.getByRole('button', { name: /confirm|yes|ok/i });
      if (await confirm.isVisible({ timeout: 1000 }).catch(() => false)) await confirm.click();
    }
  });

  test('role dropdown shows for other members but not for self', async ({ page }) => {
    await page.goto('/teams/1/members');
    const selfRow = page.locator('tr').filter({ has: page.locator('text=You') });
    // Self row: no dropdown, just a static badge
    await expect(selfRow.locator('p-select')).not.toBeVisible();
    // Other rows: dropdown present
    const otherRow = page.locator('tr').filter({ hasNot: page.locator('text=You') }).first();
    await expect(otherRow.locator('p-select')).toBeVisible();
  });

  test('cannot remove self', async ({ page }) => {
    await page.goto('/teams/1/members');
    const selfRow = page.locator('tr').filter({ has: page.locator('text=You') });
    await expect(selfRow.getByRole('button', { name: /delete|remove/i })).not.toBeVisible();
  });

  test('TEAM_ADMIN option disabled when team already has one', async ({ page }) => {
    await page.goto('/teams/1/members');
    // Find a MEMBER row and open its role dropdown
    const memberRow = page.locator('tr').filter({ hasText: /MEMBER/ }).filter({ hasNot: page.locator('text=You') }).first();
    await memberRow.locator('p-select').click();
    const teamAdminOption = page.locator('[class*="option"], li').filter({ hasText: /team admin/i }).first();
    // Should be present but disabled (aria-disabled or has disabled class)
    await expect(teamAdminOption).toHaveAttribute('aria-disabled', 'true', { timeout: 3000 });
  });

});
