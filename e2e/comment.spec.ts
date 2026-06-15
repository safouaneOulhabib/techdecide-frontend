import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, deleteDecisionApi } from './helpers';

test.describe('Comment — project member posts a comment', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });

  const GTN_PROJECT_ID = 1;
  const BACKEND_TEAM_ID = 1;

  test('can post a comment and see it appear on the decision', async ({ page }) => {
    const token = getToken('backend-member');
    const id = await createDecisionApi(page, token, {
      title: 'E2E Comment Journey', context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    try {
      await page.goto(`/decisions/${id}`);
      await page.locator('textarea[placeholder*="thoughts"]').fill('My E2E journey comment');
      await page.getByRole('button', { name: /post comment/i }).click();
      await expect(
        page.locator('.comment-content').filter({ hasText: 'My E2E journey comment' })
      ).toBeVisible({ timeout: 8000 });
    } finally {
      await deleteDecisionApi(page, token, id);
    }
  });
});
