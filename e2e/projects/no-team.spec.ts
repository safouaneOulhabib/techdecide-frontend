import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/no-team.json' });

test.describe('Projects — NO_TEAM user', () => {

  test('projects list shows no project rows', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).not.toHaveURL(/login/);
    await page.waitForLoadState('networkidle');
    // No-team user sees an empty state — no data rows in the project table
    // Either we see 0 <tr> rows in tbody, or the empty-state div is visible
    const rows = page.locator('p-table tr[app-project-card]');
    await expect(rows).toHaveCount(0, { timeout: 8000 });
  });

  test('Create Project button is NOT visible', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('button', { name: /new project/i })).not.toBeVisible();
  });

});
