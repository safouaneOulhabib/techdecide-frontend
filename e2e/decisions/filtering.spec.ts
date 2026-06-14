import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, updateStatusApi, deleteDecisionApi, createTagApi, deleteTagApi } from '../helpers';

test.use({ storageState: 'e2e/.auth/backend-admin.json' });

const BACKEND_TEAM_ID = 1;

test.describe('Decisions — Filtering', () => {

  test('keyword filter shows only matching decisions', async ({ page }) => {
    const token = getToken('backend-admin');
    const adminToken = getToken('admin');
    const uid = Date.now();
    const title = `E2E Keyword Filter ${uid}`;
    const id = await createDecisionApi(page, token, {
      title, context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    try {
      await page.goto('/decisions');
      await page.locator('.filters-bar input[placeholder*="Search"]').fill(`keyword-filter-${uid}`);
      // Unique enough that only our decision matches (or no decisions)
      await page.waitForTimeout(500);
      // Now search for the actual title fragment
      await page.locator('.filters-bar input[placeholder*="Search"]').fill(title);
      await expect(page.locator('.decision-card').filter({ hasText: title })).toBeVisible({ timeout: 5000 });
    } finally {
      await deleteDecisionApi(page, adminToken, id);
    }
  });

  test('status filter shows only decisions of selected status', async ({ page }) => {
    const token = getToken('backend-admin');
    const adminToken = getToken('admin');
    const uid = Date.now();
    const draftTitle = `E2E Status Filter Draft ${uid}`;
    const proposedTitle = `E2E Status Filter Proposed ${uid}`;

    const draftId = await createDecisionApi(page, token, {
      title: draftTitle, context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    const proposedId = await createDecisionApi(page, token, {
      title: proposedTitle, context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    await updateStatusApi(page, token, proposedId, 'PROPOSED');

    try {
      await page.goto('/decisions');
      // Open the status filter
      await page.locator('.filters-bar').getByText('All Statuses').click();
      await page.locator('.p-select-option').filter({ hasText: /^proposed$/i }).click();
      await page.waitForTimeout(300);

      await expect(page.locator('.decision-card').filter({ hasText: proposedTitle })).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.decision-card').filter({ hasText: draftTitle })).not.toBeVisible();
    } finally {
      await deleteDecisionApi(page, adminToken, draftId);
      await deleteDecisionApi(page, adminToken, proposedId);
    }
  });

  test('clear filters button resets all filters', async ({ page }) => {
    const token = getToken('backend-admin');
    const adminToken = getToken('admin');
    const uid = Date.now();
    const title = `E2E Clear Filter ${uid}`;
    const id = await createDecisionApi(page, token, {
      title, context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    try {
      await page.goto('/decisions');
      // Apply a filter that hides our decision
      await page.locator('.filters-bar').getByText('All Statuses').click();
      await page.locator('.p-select-option').filter({ hasText: /^approved$/i }).click();
      await page.waitForTimeout(300);

      // Decision (DRAFT) should not be visible under APPROVED filter
      await expect(page.locator('.decision-card').filter({ hasText: title })).not.toBeVisible();

      // Clear filters
      await page.getByRole('button', { name: /clear/i }).click();
      await expect(page.locator('.decision-card').filter({ hasText: title })).toBeVisible({ timeout: 5000 });
    } finally {
      await deleteDecisionApi(page, adminToken, id);
    }
  });

  test('tag filter shows only decisions tagged with selected tag', async ({ page }) => {
    const token = getToken('backend-admin');
    const adminToken = getToken('admin');
    const uid = Date.now();

    // Create tag first, then create the decision with that tag attached via tagIds
    const tagId = await createTagApi(page, adminToken, `E2E Tag Filter ${uid}`, '#6366f1');
    const taggedId = await createDecisionApi(page, token, {
      title: `E2E Tagged Decision ${uid}`, context: 'ctx', decision: 'dec',
      teamId: BACKEND_TEAM_ID, tagIds: [tagId],
    });
    const untaggedId = await createDecisionApi(page, token, {
      title: `E2E Untagged Decision ${uid}`, context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });

    try {
      await page.goto('/decisions');
      await page.locator('.filters-bar').getByText('All Tags').click();
      await page.locator('.p-select-option').filter({ hasText: `E2E Tag Filter ${uid}` }).click();
      await page.waitForTimeout(300);

      await expect(page.locator('.decision-card').filter({ hasText: `E2E Tagged Decision ${uid}` })).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.decision-card').filter({ hasText: `E2E Untagged Decision ${uid}` })).not.toBeVisible();
    } finally {
      await deleteDecisionApi(page, adminToken, taggedId);
      await deleteDecisionApi(page, adminToken, untaggedId);
      await deleteTagApi(page, adminToken, tagId);
    }
  });

});
