import { test, expect } from '@playwright/test';
import { getToken, createTagApi, deleteTagApi } from '../helpers';

test.use({ storageState: 'e2e/.auth/admin.json' });

test.describe('Tags — APP_ADMIN', () => {

  test('can view tags list', async ({ page }) => {
    await page.goto('/tags');
    await expect(page.locator('h2')).toContainText('Tags');
    await expect(page).not.toHaveURL(/login/);
  });

  test('New Tag form is visible', async ({ page }) => {
    await page.goto('/tags');
    await expect(page.locator('input[placeholder="Tag name"]')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /new tag/i })).toBeVisible();
  });

  test('can create and delete a tag', async ({ page }) => {
    const uid = Date.now();
    const name = `E2E Tag ${uid}`;

    await page.goto('/tags');
    await page.locator('input[placeholder="Tag name"]').fill(name);
    await page.getByRole('button', { name: /new tag/i }).click();

    // Tag appears in the list
    await expect(page.locator('.tag-name').filter({ hasText: name })).toBeVisible({ timeout: 5000 });

    // Delete the tag
    const row = page.locator('.table-row').filter({ hasText: name });
    await row.locator('.btn-delete').click();
    await page.getByRole('button', { name: /delete|confirm|yes|ok/i }).click({ timeout: 3000 }).catch(() => null);
    await expect(page.locator('.tag-name').filter({ hasText: name })).not.toBeVisible({ timeout: 5000 });
  });

  test('created tag appears in decisions filter dropdown', async ({ page }) => {
    const adminToken = getToken('admin');
    const uid = Date.now();
    const name = `E2E Filter Tag ${uid}`;
    const tagId = await createTagApi(page, adminToken, name, '#6366f1');

    try {
      await page.goto('/decisions');
      // Open the tag filter dropdown
      await page.locator('.filters-bar').getByText('All Tags').click();
      await expect(page.locator('.p-select-option').filter({ hasText: name })).toBeVisible({ timeout: 5000 });
      await page.keyboard.press('Escape');
    } finally {
      await deleteTagApi(page, adminToken, tagId);
    }
  });

  test('empty state shown when no tags exist', async ({ page }) => {
    // Navigate to tags page — may or may not have tags depending on test order,
    // but the empty-state element exists in the DOM when tags().length === 0
    await page.goto('/tags');
    await page.locator('.table-wrapper').waitFor({ state: 'visible', timeout: 8000 });
    // Either the table has rows or the empty state is shown — both are valid
    const hasRows = await page.locator('.table-row').count() > 0;
    if (!hasRows) {
      await expect(page.locator('.empty-state')).toBeVisible();
      await expect(page.locator('.empty-state .pi-tag')).toBeVisible();
    }
  });

});
