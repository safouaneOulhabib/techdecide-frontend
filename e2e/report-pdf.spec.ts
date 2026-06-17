import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, deleteDecisionApi, createReportApi, deleteReportApi, updateStatusApi } from './helpers';

test.describe('Report PDF — REP-16 REP-17 DATA-06', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });
  test.setTimeout(60000);

  const GTN_PROJECT_ID = 1;
  const BACKEND_TEAM_ID = 1;

  test('REP-16 Download PDF button triggers a file download', async ({ page }) => {
    const token = getToken('backend-member');
    const uid = Date.now();
    const decisionId = await createDecisionApi(page, token, {
      title: `E2E PDF DL ${uid}`, context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    const reportId = await createReportApi(page, token, `E2E PDF DL Report ${uid}`, [decisionId], GTN_PROJECT_ID);

    try {
      await page.goto(`/reports/${reportId}`);
      await expect(page.locator('h1').filter({ hasText: `E2E PDF DL Report ${uid}` }))
        .toBeVisible({ timeout: 12000 });

      const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
      await page.getByRole('button', { name: /download pdf/i }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    } finally {
      await deleteReportApi(page, token, reportId).catch(() => null);
      await deleteDecisionApi(page, token, decisionId).catch(() => null);
    }
  });

  test('REP-17 PDF preview page renders iframe with report content', async ({ page }) => {
    const token = getToken('backend-member');
    const adminToken = getToken('backend-admin');
    const uid = Date.now();

    // Create an APPROVED decision so the status pill appears in the PDF
    const decisionId = await createDecisionApi(page, token, {
      title: `E2E PDF Preview ${uid}`, context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    await updateStatusApi(page, adminToken, decisionId, 'PROPOSED');
    await updateStatusApi(page, adminToken, decisionId, 'APPROVED');

    const reportId = await createReportApi(page, token, `E2E PDF Preview Report ${uid}`, [decisionId], GTN_PROJECT_ID);

    try {
      await page.goto(`/reports/${reportId}/pdf-preview`);
      // Preview page title
      await expect(page.locator('h1').filter({ hasText: `E2E PDF Preview Report ${uid}` }))
        .toBeVisible({ timeout: 12000 });
      // iframe with PDF blob is rendered
      await expect(page.locator('iframe.pdf-frame')).toBeVisible({ timeout: 15000 });
      // Download PDF button available on preview page
      await expect(page.getByRole('button', { name: /download pdf/i })).toBeVisible();
    } finally {
      await deleteReportApi(page, token, reportId).catch(() => null);
      await deleteDecisionApi(page, token, decisionId).catch(() => null);
    }
  });

  test('DATA-06 report with many decisions renders all items and PDF preview is reachable', async ({ page }) => {
    const token = getToken('backend-member');
    const adminToken = getToken('backend-admin');
    const uid = Date.now();

    // Create 4 decisions
    const ids: number[] = [];
    for (let i = 1; i <= 4; i++) {
      const id = await createDecisionApi(page, token, {
        title: `E2E DATA-06 Dec ${i} ${uid}`, context: 'ctx', decision: 'dec',
        projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
      });
      ids.push(id);
    }
    const reportId = await createReportApi(page, token, `E2E DATA-06 Report ${uid}`, ids, GTN_PROJECT_ID);

    try {
      await page.goto(`/reports/${reportId}`);
      await expect(page.locator('h1').filter({ hasText: `E2E DATA-06 Report ${uid}` }))
        .toBeVisible({ timeout: 12000 });

      // All 4 decision snapshots listed
      const items = page.locator('app-report-item-card');
      await expect(items).toHaveCount(4, { timeout: 10000 });

      // PDF preview is reachable
      await page.goto(`/reports/${reportId}/pdf-preview`);
      await expect(page.locator('iframe.pdf-frame')).toBeVisible({ timeout: 15000 });
    } finally {
      await deleteReportApi(page, adminToken, reportId).catch(() => null);
      for (const id of ids) {
        await deleteDecisionApi(page, adminToken, id).catch(() => null);
      }
    }
  });
});
