import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, deleteDecisionApi } from './helpers';

test.describe('Vote — involved member casts a vote', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });

  const GTN_PROJECT_ID = 1;
  const BACKEND_TEAM_ID = 1;

  test('COM-01 COM-06 COM-10 can post a comment with Approve vote and see vote badge', async ({ page }) => {
    const token = getToken('backend-member');
    const id = await createDecisionApi(page, token, {
      title: 'E2E Vote Journey', context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    try {
      await page.goto(`/decisions/${id}`);
      await page.locator('textarea[placeholder*="thoughts"]').fill('Looks good to me');
      await page.locator('p-selectbutton').getByRole('button', { name: /approve/i }).click();
      await page.getByRole('button', { name: /post comment/i }).click();
      const comment = page.locator('.comment-item').filter({ hasText: 'Looks good to me' });
      await expect(comment).toBeVisible({ timeout: 8000 });
      await expect(comment.locator('p-tag')).toContainText(/approve/i);
    } finally {
      await deleteDecisionApi(page, token, id);
    }
  });
});
