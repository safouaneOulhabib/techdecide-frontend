import { test, expect } from '@playwright/test';

test.describe('Tag admin — APP_ADMIN creates and deletes a tag', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('can create a tag and delete it', async ({ page }) => {
    const uid = Date.now();
    const name = `E2E Tag ${uid}`;

    await page.goto('/tags');
    await page.locator('input[placeholder="Tag name"]').fill(name);
    await page.getByRole('button', { name: /new tag/i }).click();

    await expect(page.locator('.tag-name').filter({ hasText: name })).toBeVisible({ timeout: 8000 });

    const row = page.locator('.table-row').filter({ hasText: name });
    await row.locator('.btn-delete').click();
    await page.getByRole('button', { name: /delete|confirm|yes|ok/i }).click({ timeout: 3000 }).catch(() => null);
    await expect(page.locator('.tag-name').filter({ hasText: name })).not.toBeVisible({ timeout: 5000 });
  });
});
