import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/admin.json' });

test.describe('Admin — decisions', () => {

  test('APP_ADMIN badge shown in sidebar', async ({ page }) => {
    await page.goto('/decisions');
    await expect(page.locator('text=APP_ADMIN')).toBeVisible();
  });

  test('can create a decision', async ({ page }) => {
    await page.goto('/decisions');
    await page.getByRole('button', { name: /new decision/i }).click();
    await page.getByLabel(/title/i).fill('E2E Admin Decision');
    await page.getByLabel(/context/i).fill('E2E context');
    await page.getByLabel(/decision/i).first().fill('E2E decision body');
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    await page.waitForURL(/decisions\/\d+/);
    await expect(page.locator('text=E2E Admin Decision')).toBeVisible();
  });

  test('edit button visible on DRAFT, hidden on APPROVED', async ({ page }) => {
    // Create a fresh decision
    await page.goto('/decisions');
    await page.getByRole('button', { name: /new decision/i }).click();
    await page.getByLabel(/title/i).fill('E2E Edit Guard');
    await page.getByLabel(/context/i).fill('ctx');
    await page.getByLabel(/decision/i).first().fill('dec');
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    await page.waitForURL(/decisions\/\d+/);

    // Edit visible on DRAFT
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();

    // Advance to APPROVED
    await page.getByRole('combobox').first().selectOption('PROPOSED');
    await page.getByRole('combobox').first().selectOption('APPROVED');
    await page.waitForTimeout(500);

    // Edit hidden on APPROVED
    await expect(page.getByRole('button', { name: /edit/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).not.toBeVisible();
  });

  test('can delete a DRAFT decision', async ({ page }) => {
    await page.goto('/decisions');
    await page.getByRole('button', { name: /new decision/i }).click();
    await page.getByLabel(/title/i).fill('E2E Delete Me');
    await page.getByLabel(/context/i).fill('ctx');
    await page.getByLabel(/decision/i).first().fill('dec');
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    await page.waitForURL(/decisions\/\d+/);
    await page.getByRole('button', { name: /delete/i }).click();
    const confirm = page.getByRole('button', { name: /confirm|yes|ok/i });
    if (await confirm.isVisible({ timeout: 1000 }).catch(() => false)) await confirm.click();
    await expect(page).toHaveURL(/decisions$/, { timeout: 5000 });
    await expect(page.locator('text=E2E Delete Me')).not.toBeVisible();
  });

  test('status selector visible and functional', async ({ page }) => {
    await page.goto('/decisions');
    await page.getByRole('button', { name: /new decision/i }).click();
    await page.getByLabel(/title/i).fill('E2E Status Flow');
    await page.getByLabel(/context/i).fill('ctx');
    await page.getByLabel(/decision/i).first().fill('dec');
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    await page.waitForURL(/decisions\/\d+/);
    const statusControl = page.getByRole('combobox').first();
    await expect(statusControl).toBeVisible();
    await statusControl.selectOption('PROPOSED');
    await expect(page.locator('text=PROPOSED')).toBeVisible();
  });

});
