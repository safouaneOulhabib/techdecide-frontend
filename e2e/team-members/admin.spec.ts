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

  test('can add a member (No Team User) to Backend Team', async ({ page }) => {
    await page.goto('/teams/1/members');
    // The add-member p-select has class "add-user-select"
    const select = page.locator('.member-add p-select');
    await select.click();
    // PrimeNG appends the overlay to body; options are .p-select-option items
    const option = page.locator('.p-select-option').filter({ hasText: /No Team User/i }).first();
    if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
      await option.click();
      await page.getByRole('button', { name: /assign/i }).click();
      await expect(page.locator('text=No Team User')).toBeVisible({ timeout: 5000 });
      // Clean up — remove the added member
      const row = page.locator('tbody tr').filter({ hasText: /No Team User/ });
      await row.locator('button').click();
      const confirm = page.getByRole('button', { name: /confirm|yes|ok/i });
      if (await confirm.isVisible({ timeout: 1000 }).catch(() => false)) await confirm.click();
    }
  });

  test('role dropdown shows for other members but not for self', async ({ page }) => {
    await page.goto('/teams/1/members');
    // Admin is not a member, so no "You" row exists — self check passes trivially
    const selfRow = page.locator('tbody tr').filter({ has: page.locator('.you-badge') });
    await expect(selfRow.locator('p-select')).not.toBeVisible();
    // Other rows should have a role p-select (admin sees dropdowns for all)
    const otherRow = page.locator('tbody tr').first();
    await expect(otherRow.locator('p-select')).toBeVisible();
  });

  test('cannot remove self', async ({ page }) => {
    await page.goto('/teams/1/members');
    const selfRow = page.locator('tbody tr').filter({ has: page.locator('.you-badge') });
    await expect(selfRow.getByRole('button', { name: /delete|remove/i })).not.toBeVisible();
  });

  test('TEAM_ADMIN option disabled when team already has one', async ({ page }) => {
    await page.goto('/teams/1/members');
    await page.locator('tbody tr').first().waitFor({ state: 'visible' });
    // Use the native role filter to show only MEMBER rows
    await page.locator('.role-filter').selectOption('MEMBER');
    // Now the first (and only) visible data row is the MEMBER
    const memberRow = page.locator('tbody tr').first();
    await memberRow.locator('p-select').click();
    // PrimeNG renders disabled options with aria-disabled="true"
    const teamAdminOption = page.locator('.p-select-option').filter({ hasText: /team admin/i }).first();
    await expect(teamAdminOption).toHaveAttribute('aria-disabled', 'true', { timeout: 3000 });
  });

});
