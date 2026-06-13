import { test, expect } from '@playwright/test';
import {
  getToken,
  createDecisionApi,
  deleteDecisionApi,
  createReportApi,
  deleteReportApi,
} from '../helpers';

test.use({ storageState: 'e2e/.auth/backend-member.json' });

const BACKEND_TEAM_ID = 1;

test.describe('Reports — MEMBER1', () => {

  test('can view reports list', async ({ page }) => {
    await page.goto('/reports');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('h2')).toBeVisible({ timeout: 5000 });
  });

  test('New Report button visible (has team)', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByRole('button', { name: /new report/i })).toBeVisible({ timeout: 5000 });
  });

  test('can create a report', async ({ page }) => {
    const uid = Date.now();
    const token = getToken('backend-member');
    const decisionId = await createDecisionApi(page, token, {
      title: `E2E M1 Report Decision ${uid}`,
      context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    try {
      await page.goto('/reports/new');
      await page.locator('#report-title').fill(`E2E M1 Report ${uid}`);
      await page.locator('.picker-item').first().waitFor({ state: 'visible', timeout: 8000 });
      await page.locator('.picker-item').first().click();
      await page.locator('.btn-action.btn-primary').click();
      await page.waitForURL(/\/reports\/\d+/, { timeout: 10000 });
      await expect(page.locator(`text=E2E M1 Report ${uid}`)).toBeVisible({ timeout: 5000 });
      // Extract report id from URL for cleanup
      const reportId = Number(page.url().match(/\/reports\/(\d+)/)?.[1]);
      if (reportId) await deleteReportApi(page, token, reportId);
    } finally {
      await deleteDecisionApi(page, token, decisionId);
    }
  });

  test('can edit own report title', async ({ page }) => {
    const uid = Date.now();
    const token = getToken('backend-member');
    const decisionId = await createDecisionApi(page, token, {
      title: `E2E M1 Edit Report Dec ${uid}`,
      context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    const reportId = await createReportApi(page, token, `E2E M1 Edit Report ${uid}`, [decisionId]);
    try {
      await page.goto(`/reports/${reportId}`);
      await page.getByRole('button', { name: /edit/i }).click();
      await page.locator('.edit-panel input[type="text"]').fill(`E2E M1 Edit Report ${uid} Updated`);
      await page.getByRole('button', { name: /save/i }).click();
      await expect(page.locator(`text=E2E M1 Edit Report ${uid} Updated`)).toBeVisible({ timeout: 5000 });
    } finally {
      await deleteReportApi(page, token, reportId);
      await deleteDecisionApi(page, token, decisionId);
    }
  });

  test('can delete own report', async ({ page }) => {
    const uid = Date.now();
    const token = getToken('backend-member');
    const decisionId = await createDecisionApi(page, token, {
      title: `E2E M1 Del Report Dec ${uid}`,
      context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    const reportId = await createReportApi(page, token, `E2E M1 Del Report ${uid}`, [decisionId]);
    try {
      await page.goto('/reports');
      const card = page.locator('.report-card').filter({ hasText: `E2E M1 Del Report ${uid}` }).first();
      await card.waitFor({ state: 'visible', timeout: 5000 });
      await card.locator('.btn-delete').click();
      const confirm = page.getByRole('button', { name: /confirm|yes|ok/i });
      if (await confirm.isVisible({ timeout: 1500 }).catch(() => false)) await confirm.click();
      await expect(page.locator('.report-card').filter({ hasText: `E2E M1 Del Report ${uid}` }))
        .not.toBeVisible({ timeout: 5000 });
    } finally {
      await deleteDecisionApi(page, token, decisionId);
    }
  });

  test('cannot edit or delete another users report', async ({ page }) => {
    const memberToken = getToken('backend-member');
    const adminToken = getToken('admin');
    const decisionId = await createDecisionApi(page, adminToken, {
      title: 'E2E Admin Report Dec', context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    const reportId = await createReportApi(page, adminToken, 'E2E Admin Report', [decisionId]);
    try {
      await page.goto(`/reports/${reportId}`);
      await expect(page.getByRole('button', { name: /edit/i })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /delete/i })).not.toBeVisible();
    } finally {
      await deleteReportApi(page, adminToken, reportId);
      await deleteDecisionApi(page, adminToken, decisionId);
    }
  });

});
