import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/backend-admin.json' });

test.describe('Team Members — TEAM_ADMIN1', () => {

  test('can access own team (Backend) members page', async ({ page }) => {
    await page.goto('/teams/1/members');
    await expect(page).not.toHaveURL(/login|decisions$/);
    await expect(page.locator('text=Team Members')).toBeVisible({ timeout: 5000 });
  });

  test('redirected from Devops team members page', async ({ page }) => {
    await page.goto('/teams/2/members');
    await expect(page).toHaveURL(/decisions/, { timeout: 5000 });
  });

  test('role dropdown visible for other members (not self)', async ({ page }) => {
    await page.goto('/teams/1/members');
    await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });
    // Non-self rows should have a role p-select dropdown
    const nonSelfRows = page.locator('tbody tr').filter({ hasNot: page.locator('.you-badge') });
    const count = await nonSelfRows.count();
    if (count > 0) {
      await expect(nonSelfRows.first().locator('p-select')).toBeVisible();
    }
    // Self row should NOT have a role dropdown
    const selfRow = page.locator('tbody tr').filter({ has: page.locator('.you-badge') });
    if (await selfRow.count() > 0) {
      await expect(selfRow.locator('p-select')).not.toBeVisible();
    }
  });

  test('cannot remove self', async ({ page }) => {
    await page.goto('/teams/1/members');
    const selfRow = page.locator('tbody tr').filter({ has: page.locator('.you-badge') });
    if (await selfRow.count() > 0) {
      await expect(selfRow.locator('button:has(.pi-trash)')).not.toBeVisible();
    }
  });

  test('can add a no-team user to Backend Team and remove them', async ({ page }) => {
    await page.goto('/teams/1/members');
    const select = page.locator('.member-add p-select');
    await select.click();
    const option = page.locator('.p-select-option').first();
    const available = await option.isVisible({ timeout: 3000 }).catch(() => false);
    if (!available) {
      // No available users — skip cleanly
      return;
    }
    const optionText = await option.textContent();
    await option.click();
    await page.getByRole('button', { name: /assign/i }).click();
    if (optionText) {
      await expect(page.locator('tbody tr').filter({ hasText: optionText.trim() }))
        .toBeVisible({ timeout: 5000 });
      // Cleanup — remove the added member
      const row = page.locator('tbody tr').filter({ hasText: optionText.trim() });
      await row.locator('button:has(.pi-trash)').click();
      const confirm = page.getByRole('button', { name: /confirm|yes|ok/i });
      if (await confirm.isVisible({ timeout: 1000 }).catch(() => false)) await confirm.click();
    }
  });

  test('TEAM_ADMIN option disabled when team already has one', async ({ page }) => {
    await page.goto('/teams/1/members');
    await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });
    // Filter to MEMBER rows only
    await page.locator('.role-filter').selectOption('MEMBER');
    const memberRow = page.locator('tbody tr').first();
    const hasDropdown = await memberRow.locator('p-select').isVisible({ timeout: 2000 }).catch(() => false);
    if (!hasDropdown) return;
    await memberRow.locator('p-select').click();
    const teamAdminOption = page.locator('.p-select-option').filter({ hasText: /team admin/i }).first();
    await expect(teamAdminOption).toHaveAttribute('data-p-disabled', 'true', { timeout: 3000 });
    await page.keyboard.press('Escape');
  });

});
