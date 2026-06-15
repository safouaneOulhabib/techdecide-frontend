import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, deleteDecisionApi, createReportApi, deleteReportApi } from './helpers';

// A user with no team cannot access a project-scoped report.
test.describe('Report access — no-team user blocked', () => {
  test.use({ storageState: 'e2e/.auth/no-team.json' });

  const GTN_PROJECT_ID = 1;
  const BACKEND_TEAM_ID = 1;

  test('no-team user cannot view a project report', async ({ page }) => {
    const backendToken = getToken('backend-member');
    const adminToken = getToken('admin');
    const uid = Date.now();
    const decisionId = await createDecisionApi(page, backendToken, {
      title: `E2E NoTeam Report Dec ${uid}`,
      context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    const reportId = await createReportApi(page, backendToken, `E2E NoTeam Report ${uid}`, [decisionId], GTN_PROJECT_ID);
    try {
      await page.goto(`/reports/${reportId}`);
      // No-team users get scoped out — report title must not be visible
      await expect(page.locator('h1').filter({ hasText: `E2E NoTeam Report ${uid}` }))
        .not.toBeVisible({ timeout: 5000 });
    } finally {
      await deleteReportApi(page, adminToken, reportId).catch(() => null);
      await deleteDecisionApi(page, adminToken, decisionId).catch(() => null);
    }
  });
});
