import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, deleteDecisionApi } from './helpers';

test.describe('UI miscellaneous — back button, dark mode, wildcard route', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });
  test.setTimeout(30000);

  const GTN_PROJECT_ID = 1;
  const BACKEND_TEAM_ID = 1;

  test('UI-10 wildcard route redirects to /decisions', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await expect(page).toHaveURL(/\/decisions/, { timeout: 8000 });
  });

  test('UI-05 dark mode toggle applies my-app-dark class to html element', async ({ page }) => {
    await page.goto('/decisions');
    await expect(page).toHaveURL(/decisions/, { timeout: 8000 });

    const htmlEl = page.locator('html');
    await expect(htmlEl).not.toHaveClass(/my-app-dark/);

    await page.locator('button[title="Toggle dark mode"]').click();
    await expect(htmlEl).toHaveClass(/my-app-dark/, { timeout: 3000 });

    // Toggle back to restore state
    await page.locator('button[title="Toggle dark mode"]').click();
    await expect(htmlEl).not.toHaveClass(/my-app-dark/);
  });

  test('UI-03 back button on decision detail returns to decisions list', async ({ page }) => {
    const token = getToken('backend-member');
    const uid = Date.now();
    const decisionId = await createDecisionApi(page, token, {
      title: `E2E Back Button ${uid}`,
      context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });

    try {
      await page.goto('/decisions');
      await expect(page).toHaveURL(/decisions/, { timeout: 8000 });

      await page.goto(`/decisions/${decisionId}`);
      await expect(page.locator('h1').filter({ hasText: `E2E Back Button ${uid}` }))
        .toBeVisible({ timeout: 10000 });

      await page.locator('.btn-back').click();
      await expect(page).toHaveURL(/\/decisions$/, { timeout: 8000 });
    } finally {
      await deleteDecisionApi(page, token, decisionId).catch(() => null);
    }
  });
});
