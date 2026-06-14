import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, deleteDecisionApi, createCommentApi } from '../helpers';

test.use({ storageState: 'e2e/.auth/backend-member.json' });

const BACKEND_TEAM_ID = 1;

test.describe('Comments — Voting', () => {

  test('can post a comment with Approve vote', async ({ page }) => {
    const token = getToken('backend-member');
    const id = await createDecisionApi(page, token, {
      title: 'E2E Vote Approve', context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    try {
      await page.goto(`/decisions/${id}`);
      await page.locator('textarea[placeholder*="thoughts"]').fill('Looks good to me');
      await page.locator('p-selectbutton button').filter({ hasText: /approve/i }).click();
      await page.getByRole('button', { name: /post comment/i }).click();
      const comment = page.locator('.comment-item').filter({ hasText: 'Looks good to me' });
      await expect(comment).toBeVisible({ timeout: 5000 });
      await expect(comment.locator('p-tag')).toContainText(/approve/i);
    } finally {
      await deleteDecisionApi(page, token, id);
    }
  });

  test('can post a comment with Reject vote', async ({ page }) => {
    const token = getToken('backend-member');
    const id = await createDecisionApi(page, token, {
      title: 'E2E Vote Reject', context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    try {
      await page.goto(`/decisions/${id}`);
      await page.locator('textarea[placeholder*="thoughts"]').fill('I disagree with this');
      await page.locator('p-selectbutton button').filter({ hasText: /reject/i }).click();
      await page.getByRole('button', { name: /post comment/i }).click();
      const comment = page.locator('.comment-item').filter({ hasText: 'I disagree with this' });
      await expect(comment).toBeVisible({ timeout: 5000 });
      await expect(comment.locator('p-tag')).toContainText(/reject/i);
    } finally {
      await deleteDecisionApi(page, token, id);
    }
  });

  test('can post a comment with Abstain vote', async ({ page }) => {
    const token = getToken('backend-member');
    const id = await createDecisionApi(page, token, {
      title: 'E2E Vote Abstain', context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    try {
      await page.goto(`/decisions/${id}`);
      await page.locator('textarea[placeholder*="thoughts"]').fill('No strong opinion');
      await page.locator('p-selectbutton button').filter({ hasText: /abstain/i }).click();
      await page.getByRole('button', { name: /post comment/i }).click();
      const comment = page.locator('.comment-item').filter({ hasText: 'No strong opinion' });
      await expect(comment).toBeVisible({ timeout: 5000 });
      await expect(comment.locator('p-tag')).toContainText(/abstain/i);
    } finally {
      await deleteDecisionApi(page, token, id);
    }
  });

  test('comment without vote shows no vote badge', async ({ page }) => {
    const token = getToken('backend-member');
    const id = await createDecisionApi(page, token, {
      title: 'E2E Vote None', context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    try {
      await page.goto(`/decisions/${id}`);
      await page.locator('textarea[placeholder*="thoughts"]').fill('Just a neutral comment');
      await page.getByRole('button', { name: /post comment/i }).click();
      const comment = page.locator('.comment-item').filter({ hasText: 'Just a neutral comment' });
      await expect(comment).toBeVisible({ timeout: 5000 });
      await expect(comment.locator('p-tag')).not.toBeVisible();
    } finally {
      await deleteDecisionApi(page, token, id);
    }
  });

  test('vote summary shows correct counts', async ({ page }) => {
    const memberToken = getToken('backend-member');
    const adminToken = getToken('admin');
    const backendAdminToken = getToken('backend-admin');
    const id = await createDecisionApi(page, memberToken, {
      title: 'E2E Vote Summary', context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    await createCommentApi(page, memberToken, id, 'Member approves', 'APPROVE');
    await createCommentApi(page, backendAdminToken, id, 'Admin rejects', 'REJECT');
    try {
      await page.goto(`/decisions/${id}`);
      await expect(page.locator('.vote-summary')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.vote-item.approved .vote-count')).toHaveText('1');
      await expect(page.locator('.vote-item.rejected .vote-count')).toHaveText('1');
      await expect(page.locator('.vote-item.abstained .vote-count')).toHaveText('0');
      await expect(page.locator('.vote-total')).toContainText('2 votes');
    } finally {
      await deleteDecisionApi(page, adminToken, id);
    }
  });

});
