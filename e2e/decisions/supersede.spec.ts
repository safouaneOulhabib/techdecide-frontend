import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, updateStatusApi, deleteDecisionApi } from '../helpers';

test.use({ storageState: 'e2e/.auth/backend-admin.json' });

const BACKEND_TEAM_ID = 1;

test.describe('Decisions — Supersede Flow', () => {

  test('TEAM_ADMIN can supersede an APPROVED decision with another APPROVED decision', async ({ page }) => {
    const adminToken = getToken('admin');
    const backendAdminToken = getToken('backend-admin');
    const uid = Date.now();
    const titleA = `E2E Supersede Source ${uid}`;
    const titleB = `E2E Supersede Target ${uid}`;

    // Create and approve both decisions
    const idA = await createDecisionApi(page, backendAdminToken, {
      title: titleA, context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    await updateStatusApi(page, backendAdminToken, idA, 'PROPOSED');
    await updateStatusApi(page, backendAdminToken, idA, 'APPROVED');

    const idB = await createDecisionApi(page, backendAdminToken, {
      title: titleB, context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    await updateStatusApi(page, backendAdminToken, idB, 'PROPOSED');
    await updateStatusApi(page, backendAdminToken, idB, 'APPROVED');

    try {
      // Navigate to decision A and open the supersede dialog
      await page.goto(`/decisions/${idA}`);
      await page.waitForSelector('app-decision-status-badge', { timeout: 8000 });
      await page.getByRole('button', { name: /^supersede$/i }).click();

      // Dialog opens — select decision B as the superseder
      await page.locator('.dialog-body p-select').click();
      await page.locator('.p-select-option').filter({ hasText: titleB }).click();

      // Confirm the supersede
      await page.locator('.dialog-footer').getByRole('button', { name: /^supersede$/i }).click();

      // Decision A should now show the superseded banner pointing to decision B
      await expect(page.locator('.superseded-banner')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('.superseded-banner')).toContainText(titleB);
    } finally {
      // APPROVED/SUPERSEDED decisions can only be deleted by APP_ADMIN
      await deleteDecisionApi(page, adminToken, idA).catch(() => null);
      await deleteDecisionApi(page, adminToken, idB).catch(() => null);
    }
  });

  test('Supersede button NOT visible on non-APPROVED decision', async ({ page }) => {
    const token = getToken('backend-admin');
    const adminToken = getToken('admin');
    const id = await createDecisionApi(page, token, {
      title: 'E2E Supersede Guard', context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    try {
      await page.goto(`/decisions/${id}`);
      await page.waitForSelector('app-decision-status-badge', { timeout: 5000 });
      // DRAFT decision — Supersede should not be visible
      await expect(page.getByRole('button', { name: /^supersede$/i })).not.toBeVisible();
    } finally {
      await deleteDecisionApi(page, adminToken, id);
    }
  });

  test('supersede dialog shows empty state when no other APPROVED decision exists', async ({ page }) => {
    const adminToken = getToken('admin');
    const backendAdminToken = getToken('backend-admin');
    const uid = Date.now();

    const idA = await createDecisionApi(page, backendAdminToken, {
      title: `E2E Supersede Alone ${uid}`, context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    await updateStatusApi(page, backendAdminToken, idA, 'PROPOSED');
    await updateStatusApi(page, backendAdminToken, idA, 'APPROVED');

    try {
      await page.goto(`/decisions/${idA}`);
      await page.waitForSelector('app-decision-status-badge', { timeout: 8000 });
      await page.getByRole('button', { name: /^supersede$/i }).click();
      // No other APPROVED decisions from this test — dialog shows empty state or disabled button
      const dialogBody = page.locator('p-dialog');
      await expect(dialogBody).toBeVisible({ timeout: 5000 });
      // The Supersede confirm button must be disabled when there are no candidates
      const confirmBtn = page.locator('.dialog-footer').getByRole('button', { name: /^supersede$/i });
      await expect(confirmBtn).toBeDisabled();
    } finally {
      await deleteDecisionApi(page, adminToken, idA).catch(() => null);
    }
  });

});
