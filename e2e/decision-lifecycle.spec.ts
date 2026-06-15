import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, deleteDecisionApi, updateStatusApi } from './helpers';

// Full decision lifecycle: MEMBER creates (via API) → proposes via UI status selector →
// TEAM_ADMIN approves via API → UI is verified to show the APPROVED terminal state.
// The status selector UI is the critical end-to-end journey step that unit tests cannot cover.
test.describe('Decision lifecycle — create → propose → approve', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });
  test.setTimeout(45000);

  const GTN_PROJECT_ID = 1;
  const BACKEND_TEAM_ID = 1;

  test('MEMBER proposes a DRAFT via UI; TEAM_ADMIN approves; UI shows APPROVED', async ({ page }) => {
    const adminToken = getToken('admin');
    const backendMemberToken = getToken('backend-member');
    const backendAdminToken = getToken('backend-admin');
    const uid = Date.now();

    // Step 1 — MEMBER creates a DRAFT decision via API (setup)
    const decisionId = await createDecisionApi(page, backendMemberToken, {
      title: `E2E Lifecycle ${uid}`, context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });

    try {
      // Step 2 — MEMBER navigates to the decision detail and advances DRAFT → PROPOSED via UI
      await page.goto(`/decisions/${decisionId}`);
      await expect(
        page.locator('app-decision-status-badge').filter({ hasText: /DRAFT/i })
      ).toBeVisible({ timeout: 8000 });
      await page.locator('.status-selector p-select').click();
      await page.locator('.p-select-option').filter({ hasText: /^Proposed$/ }).click();
      await expect(
        page.locator('app-decision-status-badge').filter({ hasText: /PROPOSED/i })
      ).toBeVisible({ timeout: 8000 });

      // Step 3 — TEAM_ADMIN approves via API (cross-context governance step)
      await updateStatusApi(page, backendAdminToken, decisionId, 'APPROVED');

      // Step 4 — Reload and verify APPROVED state is reflected in the UI
      await page.reload();
      await expect(
        page.locator('app-decision-status-badge').filter({ hasText: /APPROVED/i })
      ).toBeVisible({ timeout: 8000 });
    } finally {
      await deleteDecisionApi(page, adminToken, decisionId).catch(() => null);
    }
  });
});
