import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, deleteDecisionApi } from './helpers';

// A user who is a project member (same GTN project) but NOT on the decision's involved team
// can VIEW the decision and comment but cannot vote (canVote=false → p-selectbutton hidden).
test.describe('Decision visibility — non-involved project member', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });

  const GTN_PROJECT_ID = 1;
  const DEVOPS_TEAM_ID = 2;

  test('sees decision read-only: title visible, vote UI absent', async ({ page }) => {
    const devopsToken = getToken('devops-admin');
    const adminToken = getToken('admin');
    // Decision involves only Devops team; backend-member is in GTN project → can see, cannot vote
    const id = await createDecisionApi(page, devopsToken, {
      title: 'E2E Visibility Read-Only', context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [DEVOPS_TEAM_ID],
    });
    try {
      await page.goto(`/decisions/${id}`);
      await expect(page.locator('h1')).toContainText('E2E Visibility Read-Only', { timeout: 8000 });
      await expect(page.locator('p-selectbutton')).not.toBeVisible();
    } finally {
      await deleteDecisionApi(page, adminToken, id);
    }
  });
});
