import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, deleteDecisionApi, createCommentApi } from '../helpers';

test.use({ storageState: 'e2e/.auth/backend-member.json' });

const GTN_PROJECT_ID = 1;
const BACKEND_TEAM_ID = 1;

test.describe('Comments — MEMBER1', () => {

  test('can post a comment on a Backend Team decision', async ({ page }) => {
    const token = getToken('backend-member');
    const id = await createDecisionApi(page, token, {
      title: 'E2E M1 Comment Post', context: 'ctx', decision: 'dec', projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    try {
      await page.goto(`/decisions/${id}`);
      await page.locator('textarea[placeholder*="thoughts"]').fill('My E2E test comment');
      await page.getByRole('button', { name: /post comment/i }).click();
      await expect(page.locator('.comment-content').filter({ hasText: 'My E2E test comment' }))
        .toBeVisible({ timeout: 5000 });
    } finally {
      await deleteDecisionApi(page, token, id);
    }
  });

  test('can delete own comment', async ({ page }) => {
    const token = getToken('backend-member');
    const id = await createDecisionApi(page, token, {
      title: 'E2E M1 Comment Del', context: 'ctx', decision: 'dec', projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    try {
      await page.goto(`/decisions/${id}`);
      await page.locator('textarea[placeholder*="thoughts"]').fill('Comment to delete');
      await page.getByRole('button', { name: /post comment/i }).click();
      await expect(page.locator('.comment-content').filter({ hasText: 'Comment to delete' }))
        .toBeVisible({ timeout: 5000 });
      // Delete via trash button in comment-actions
      const commentItem = page.locator('.comment-item').filter({ hasText: 'Comment to delete' });
      await commentItem.locator('.comment-actions button').click();
      await page.getByRole('button', { name: /delete|confirm|yes|ok/i }).click({ timeout: 3000 }).catch(() => null);
      await expect(page.locator('.comment-content').filter({ hasText: 'Comment to delete' }))
        .not.toBeVisible({ timeout: 5000 });
    } finally {
      await deleteDecisionApi(page, token, id);
    }
  });

  test('cannot delete others comments (no delete button)', async ({ page }) => {
    const memberToken = getToken('backend-member');
    const adminToken = getToken('admin');
    const id = await createDecisionApi(page, memberToken, {
      title: 'E2E M1 Comment Others', context: 'ctx', decision: 'dec', projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    await createCommentApi(page, adminToken, id, 'Admin comment here');
    try {
      await page.goto(`/decisions/${id}`);
      const adminComment = page.locator('.comment-item').filter({ hasText: 'Admin comment here' });
      await adminComment.waitFor({ state: 'visible', timeout: 5000 });
      await expect(adminComment.locator('.comment-actions button')).not.toBeVisible();
    } finally {
      await deleteDecisionApi(page, adminToken, id);
    }
  });

});
