import { test, expect } from '@playwright/test';

test.describe('Org admin — APP_ADMIN creates and deletes an organization', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('can create and delete an organization', async ({ page }) => {
    const uid = Date.now();
    const name = `E2E Org ${uid}`;

    await page.goto('/organizations');
    await page.getByRole('button', { name: /new organization/i }).click();
    await page.locator('#orgName').fill(name);
    await page.locator('.p-dialog-footer').getByRole('button', { name: /create/i }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 8000 });

    const row = page.locator('p-table tbody tr').filter({ hasText: name });
    await row.locator('.btn-delete').click();
    await page.getByRole('button', { name: /delete|confirm|yes|ok/i }).click({ timeout: 3000 }).catch(() => null);
    await expect(page.locator(`text=${name}`)).not.toBeVisible({ timeout: 5000 });
  });
});
