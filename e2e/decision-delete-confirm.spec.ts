import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, deleteDecisionApi } from './helpers';

test.describe('Decision delete — UI-04 confirmation dialog', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });
  test.setTimeout(30000);

  const GTN_PROJECT_ID = 1;
  const BACKEND_TEAM_ID = 1;

  test('UI-04 delete button shows confirmation dialog before deleting', async ({ page }) => {
    const token = getToken('backend-member');
    const uid = Date.now();
    const decisionId = await createDecisionApi(page, token, {
      title: `E2E Delete Confirm ${uid}`,
      context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });

    try {
      await page.goto(`/decisions/${decisionId}`);
      await expect(page.locator('h1').filter({ hasText: `E2E Delete Confirm ${uid}` }))
        .toBeVisible({ timeout: 10000 });

      // Decision must be deletable by its author — click Delete
      const deleteBtn = page.locator('.btn-delete');
      await expect(deleteBtn).toBeVisible({ timeout: 5000 });
      await deleteBtn.click();

      // PrimeNG ConfirmDialog must appear before any deletion occurs
      await expect(page.locator('.p-confirmdialog')).toBeVisible({ timeout: 5000 });

      // Dismiss with Cancel — decision must still exist
      await page.getByRole('button', { name: /cancel/i }).click();
      await expect(page.locator('.p-confirmdialog')).not.toBeVisible({ timeout: 3000 });
      await expect(page).toHaveURL(new RegExp(`/decisions/${decisionId}`));
    } finally {
      await deleteDecisionApi(page, token, decisionId).catch(() => null);
    }
  });
});
