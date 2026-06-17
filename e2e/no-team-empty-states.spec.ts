import { test, expect } from '@playwright/test';

// A user with no team assignment sees lock empty states across all major feature pages.
test.describe('No-team user — empty states across features', () => {
  test.use({ storageState: 'e2e/.auth/no-team.json' });

  test('DEC-09 REP-19 REP-20 TEAM-06 sees lock empty state on decisions, reports, and teams pages', async ({ page }) => {
    // Decisions page
    await page.goto('/decisions');
    await expect(page.locator('.empty-state .pi-lock')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.empty-state')).toContainText(/not assigned to a team/i);

    // Reports page
    await page.goto('/reports');
    await expect(page.locator('.empty-state .pi-lock')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.empty-state')).toContainText(/not assigned to a team/i);

    // Teams page
    await page.goto('/teams');
    await page.locator('.table-wrapper').waitFor({ state: 'visible', timeout: 8000 });
    await expect(page.locator('.empty-state .pi-lock')).toBeVisible({ timeout: 5000 });
  });
});
