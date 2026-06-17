import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, deleteDecisionApi, updateStatusApi } from './helpers';

// DATA-02  Very long title wraps or truncates gracefully
// LIST-10  Initial load skeleton appears before data arrives
// DEC-28   Superseded-by banner is visible and navigates to superseder
// UI-07    Superseded-by banner click-through navigates to the superseder detail
// UI-08    Same-component superseder navigation reloads the detail page correctly

const GTN_PROJECT_ID = 1;
const BACKEND_TEAM_ID = 1;

test.describe('DATA-02 — very long title wraps gracefully', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });
  test.setTimeout(30000);

  test('DATA-02 decision card with a very long title is visible without layout overflow', async ({ page }) => {
    const token = getToken('backend-member');
    const longTitle = `${'A'.repeat(120)} Very Long Title Decision`;
    const decisionId = await createDecisionApi(page, token, {
      title: longTitle, context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });

    try {
      await page.goto('/decisions');
      const card = page.locator('app-decision-card').filter({ hasText: 'A'.repeat(40) }).first();
      await expect(card).toBeVisible({ timeout: 10000 });

      // The card must not overflow horizontally beyond the viewport
      const box = await card.boundingBox();
      const viewportWidth = page.viewportSize()?.width ?? 1280;
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth + 1);
    } finally {
      await deleteDecisionApi(page, token, decisionId).catch(() => null);
    }
  });
});

test.describe('LIST-10 — skeleton appears before data loads', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });
  test.setTimeout(20000);

  test('LIST-10 skeleton cards are visible while decisions API is pending', async ({ page }) => {
    let resolveDelay!: () => void;
    const delayed = new Promise<void>(r => resolveDelay = r);

    await page.route('**/api/decisions', async route => {
      await delayed;
      await route.continue();
    });

    await page.goto('/decisions');

    // While the API is still blocked, skeleton-card elements must be present
    await expect(page.locator('.skeleton-card').first()).toBeVisible({ timeout: 5000 });

    resolveDelay();
    await page.unrouteAll();

    // After data arrives the skeletons disappear
    await expect(page.locator('.skeleton-card').first()).not.toBeVisible({ timeout: 8000 });
  });
});

test.describe('DEC-28 UI-07 UI-08 — superseded-by banner navigation', () => {
  test.use({ storageState: 'e2e/.auth/backend-admin.json' });
  test.setTimeout(60000);

  test('DEC-28 UI-07 UI-08 superseded-by banner navigates to the superseder detail', async ({ page }) => {
    const adminToken = getToken('admin');
    const backendAdminToken = getToken('backend-admin');
    const uid = Date.now();

    const idA = await createDecisionApi(page, backendAdminToken, {
      title: `E2E Banner Source ${uid}`, context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    await updateStatusApi(page, backendAdminToken, idA, 'PROPOSED');
    await updateStatusApi(page, backendAdminToken, idA, 'APPROVED');

    const idB = await createDecisionApi(page, backendAdminToken, {
      title: `E2E Banner Target ${uid}`, context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    await updateStatusApi(page, backendAdminToken, idB, 'PROPOSED');
    await updateStatusApi(page, backendAdminToken, idB, 'APPROVED');

    try {
      // Supersede A with B via UI
      await page.goto(`/decisions/${idA}`);
      await expect(page.locator('app-decision-status-badge')).toContainText(/approved/i, { timeout: 10000 });
      await page.getByRole('button', { name: /supersede/i }).first().click();
      await page.locator('.dialog-body p-select').click();
      await page.locator('.p-select-option').filter({ hasText: `E2E Banner Target ${uid}` }).click();
      await page.locator('.dialog-footer').getByRole('button', { name: /supersede/i }).click();

      // DEC-28: banner is visible on the superseded decision
      await expect(page.locator('.superseded-banner')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.superseded-banner')).toContainText(`E2E Banner Target ${uid}`);

      // UI-07: clicking banner navigates to the superseder (decision B)
      await page.locator('.superseded-banner').click();
      await expect(page).toHaveURL(new RegExp(`/decisions/${idB}`), { timeout: 8000 });

      // UI-08: superseder detail renders correctly (same component, different id)
      await expect(page.locator('h1').filter({ hasText: `E2E Banner Target ${uid}` }))
        .toBeVisible({ timeout: 8000 });
    } finally {
      await deleteDecisionApi(page, adminToken, idA).catch(() => null);
      await deleteDecisionApi(page, adminToken, idB).catch(() => null);
    }
  });
});
