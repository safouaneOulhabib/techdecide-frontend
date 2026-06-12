import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/admin.json' });

/** Helper: create a decision and land on the list page */
async function createDecision(page: any, title: string) {
  await page.goto('/decisions/create');
  // Team is required — select Backend Team
  await page.locator('#team').click();
  await page.locator('.p-select-option').filter({ hasText: 'Backend Team' }).first().click();
  await page.locator('#title').fill(title);
  await page.locator('#context').fill('E2E context');
  await page.locator('#decision').fill('E2E decision body');
  // Submit: last button in form-actions (Cancel is first, Submit is last)
  await page.locator('.form-actions').getByRole('button').last().click();
  // After submit, app navigates back to the decisions list
  await page.waitForURL(/\/decisions$/, { timeout: 10000 });
}

test.describe('Admin — decisions', () => {

  test('APP_ADMIN badge shown in sidebar', async ({ page }) => {
    await page.goto('/decisions');
    await expect(page.locator('.sidebar .user-role')).toHaveText('APP_ADMIN');
  });

  test('can create a decision', async ({ page }) => {
    await createDecision(page, 'E2E Admin Decision');
    await expect(page.locator('.decision-card').filter({ hasText: 'E2E Admin Decision' })).toBeVisible();
  });

  test('edit button visible on DRAFT, hidden on APPROVED', async ({ page }) => {
    await createDecision(page, 'E2E Edit Guard');
    // Open the new decision detail page
    await page.locator('.decision-card').filter({ hasText: 'E2E Edit Guard' }).click();
    await page.waitForURL(/decisions\/\d+/);

    // Edit visible on DRAFT
    await expect(page.locator('.btn-edit')).toBeVisible();

    // Advance to PROPOSED
    await page.locator('.status-selector p-select').click();
    await page.locator('.p-select-option').filter({ hasText: /^PROPOSED$/ }).click();
    await page.waitForTimeout(400);

    // Try to advance to APPROVED
    const approvedOption = page.locator('.p-select-option').filter({ hasText: /^APPROVED$/ });
    if (await approvedOption.isVisible({ timeout: 500 }).catch(() => false)) {
      await approvedOption.click();
    } else {
      await page.locator('.status-selector p-select').click();
      await page.locator('.p-select-option').filter({ hasText: /APPROVED/ }).first().click();
    }
    await page.waitForTimeout(400);

    // Edit hidden on APPROVED
    await expect(page.locator('.btn-edit')).not.toBeVisible();
  });

  test('can delete a DRAFT decision', async ({ page }) => {
    await createDecision(page, 'E2E Delete Me');
    // Delete button is on the card in the list
    const card = page.locator('.decision-card').filter({ hasText: 'E2E Delete Me' });
    await card.locator('.btn-delete').click();
    // Confirm deletion if dialog appears
    const confirm = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirm.isVisible({ timeout: 1500 }).catch(() => false)) await confirm.click();
    await expect(page.locator('.decision-card').filter({ hasText: 'E2E Delete Me' })).not.toBeVisible({ timeout: 5000 });
  });

  test('status selector visible and functional', async ({ page }) => {
    await createDecision(page, 'E2E Status Flow');
    // Open the decision detail
    await page.locator('.decision-card').filter({ hasText: 'E2E Status Flow' }).click();
    await page.waitForURL(/decisions\/\d+/);
    // Status selector should be visible for APP_ADMIN
    const statusSelector = page.locator('.status-selector');
    await expect(statusSelector).toBeVisible();
    // Open and pick PROPOSED
    await statusSelector.locator('p-select').click();
    await page.locator('.p-select-option').filter({ hasText: /^PROPOSED$/ }).click();
    await expect(page.locator('.decision-status-badge, app-decision-status-badge').filter({ hasText: /PROPOSED/ })).toBeVisible({ timeout: 3000 });
  });

});
