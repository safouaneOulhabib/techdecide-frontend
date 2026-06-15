import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, updateStatusApi, deleteDecisionApi } from './helpers';

test.describe('Decision supersede — full flow', () => {
  test.use({ storageState: 'e2e/.auth/backend-admin.json' });
  test.setTimeout(45000);

  const GTN_PROJECT_ID = 1;
  const BACKEND_TEAM_ID = 1;

  test('TEAM_ADMIN supersedes an APPROVED decision with another APPROVED decision', async ({ page }) => {
    const adminToken = getToken('admin');
    const backendAdminToken = getToken('backend-admin');
    const uid = Date.now();
    const titleA = `E2E Supersede Source ${uid}`;
    const titleB = `E2E Supersede Target ${uid}`;

    const idA = await createDecisionApi(page, backendAdminToken, {
      title: titleA, context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    await updateStatusApi(page, backendAdminToken, idA, 'PROPOSED');
    await updateStatusApi(page, backendAdminToken, idA, 'APPROVED');

    const idB = await createDecisionApi(page, backendAdminToken, {
      title: titleB, context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    await updateStatusApi(page, backendAdminToken, idB, 'PROPOSED');
    await updateStatusApi(page, backendAdminToken, idB, 'APPROVED');

    try {
      await page.goto(`/decisions/${idA}`);
      await expect(page.locator('app-decision-status-badge')).toContainText(/approved/i, { timeout: 10000 });
      await page.getByRole('button', { name: /supersede/i }).first().click();

      await page.locator('.dialog-body p-select').click();
      await page.locator('.p-select-option').filter({ hasText: titleB }).click();
      await page.locator('.dialog-footer').getByRole('button', { name: /supersede/i }).click();

      await expect(page.locator('.superseded-banner')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('.superseded-banner')).toContainText(titleB);
    } finally {
      await deleteDecisionApi(page, adminToken, idA).catch(() => null);
      await deleteDecisionApi(page, adminToken, idB).catch(() => null);
    }
  });
});
