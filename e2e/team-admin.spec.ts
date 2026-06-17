import { test, expect } from '@playwright/test';

test.describe('Team admin — APP_ADMIN creates and deletes a team', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('TEAM-01 TEAM-02 TEAM-03 TEAM-07 can create and delete a team', async ({ page }) => {
    const uid = Date.now();
    const name = `E2E Team ${uid}`;

    await page.goto('/teams');
    await page.getByRole('button', { name: /new team/i }).click();
    await page.locator('#teamName').fill(name);
    await page.locator('#teamOrg').click();
    await page.locator('.p-select-option').first().click();
    await page.locator('.p-dialog-footer').getByRole('button', { name: /create/i }).click();
    await page.locator('.p-dialog-mask').waitFor({ state: 'detached', timeout: 3000 }).catch(() => null);
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 8000 });

    const row = page.locator('p-table tbody tr').filter({ hasText: name });
    await row.locator('.btn-delete').click();
    await page.getByRole('button', { name: /delete/i }).click({ timeout: 3000 }).catch(() => null);
    await expect(page.locator(`text=${name}`)).not.toBeVisible({ timeout: 5000 });
  });
});
