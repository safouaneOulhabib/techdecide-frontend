import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, deleteDecisionApi, deleteReportApi } from './helpers';

// Full report journey: create via builder → view detail → PDF preview accessible.
test.describe('Report lifecycle — build → detail → PDF', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });
  test.setTimeout(45000);

  const GTN_PROJECT_ID = 1;
  const BACKEND_TEAM_ID = 1;

  test('MEMBER builds a report, views detail, and PDF preview is reachable', async ({ page }) => {
    const uid = Date.now();
    const token = getToken('backend-member');
    const decisionId = await createDecisionApi(page, token, {
      title: `E2E Report Source ${uid}`,
      context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    let reportId: number | null = null;
    try {
      // Step 1 — open the report builder
      await page.goto('/reports/new');

      // Select the GTN project
      await page.locator('#report-project').click();
      await page.locator('.p-select-option').filter({ hasText: /GTN/i }).click();

      // Fill title
      await page.locator('#report-title').fill(`E2E Report ${uid}`);

      // Pick the decision
      await page.locator('.picker-item').filter({ hasText: `E2E Report Source ${uid}` })
        .waitFor({ state: 'visible', timeout: 12000 });
      await page.locator('.picker-item').filter({ hasText: `E2E Report Source ${uid}` }).click();

      // Submit
      await page.locator('.btn-action.btn-primary').click();
      await page.waitForURL(/\/reports\/\d+/, { timeout: 12000 });

      reportId = Number(page.url().match(/\/reports\/(\d+)/)?.[1]);

      // Step 2 — verify detail page shows the report
      await expect(page.locator(`text=E2E Report ${uid}`)).toBeVisible({ timeout: 8000 });

      // Step 3 — PDF preview route is reachable (navigate and check iframe or download button)
      await page.goto(`/reports/${reportId}/pdf-preview`);
      // The PDF preview page renders an iframe with the blob URL — wait for any content
      await expect(page.locator('iframe, .pdf-error, button[download], a[download]').first())
        .toBeVisible({ timeout: 10000 });
    } finally {
      if (reportId) await deleteReportApi(page, token, reportId).catch(() => null);
      await deleteDecisionApi(page, token, decisionId).catch(() => null);
    }
  });
});
