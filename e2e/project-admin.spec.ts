import { test, expect } from '@playwright/test';
import { getToken, assignTeamToProjectApi, deleteProjectApi } from './helpers';

// APP_ADMIN creates a project via UI and assigns a team to it via API, then verifies
// the team appears in the project detail — a full admin governance journey.
test.describe('Project admin — create and assign teams', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });
  test.setTimeout(45000);

  const BACKEND_TEAM_ID = 1;

  test('APP_ADMIN creates a project via UI and assigns a team', async ({ page }) => {
    const uid = Date.now();
    const name = `E2E Admin Project ${uid}`;
    const adminToken = getToken('admin');
    let projectId: number | null = null;

    try {
      // Step 1 — create project via UI
      await page.goto('/projects');
      await page.getByRole('button', { name: /new project/i }).click();
      await page.locator('#projectName').fill(name);
      await page.locator('#projectOrg').click();
      await page.locator('.p-select-option').first().click();
      await page.locator('.p-dialog-footer').getByRole('button', { name: /create/i }).click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('tr').filter({ hasText: name })).toBeVisible({ timeout: 10000 });

      // Resolve project id from detail navigation
      const row = page.locator('tr').filter({ hasText: name }).first();
      await row.locator('button.btn-view').click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 8000 });
      projectId = Number(page.url().match(/\/projects\/(\d+)/)?.[1]);

      // Step 2 — assign Backend Team via API
      await assignTeamToProjectApi(page, adminToken, projectId, BACKEND_TEAM_ID);

      // Step 3 — verify team appears in project detail
      await page.reload();
      await page.waitForLoadState('networkidle');
      await expect(
        page.locator('tr, .team-row').filter({ hasText: /backend team/i })
      ).toBeVisible({ timeout: 8000 });
    } finally {
      if (projectId) await deleteProjectApi(page, adminToken, projectId).catch(() => null);
    }
  });
});
