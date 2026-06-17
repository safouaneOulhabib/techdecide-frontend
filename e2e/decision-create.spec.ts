import { test, expect } from '@playwright/test';

// DEC-01: MEMBER navigates to the create decision page and the project dropdown
// shows only the projects their team belongs to (GTN), not every project in the org.
// This verifies that the server-side team-scoped project list is reflected in the UI.
test.describe('Decision create — project dropdown scope for MEMBER', () => {
  test.use({ storageState: 'e2e/.auth/backend-member.json' });

  test('DEC-01 project dropdown shows only GTN for backend MEMBER', async ({ page }) => {
    await page.goto('/decisions/create');
    await page.waitForLoadState('networkidle');

    // Open the project p-select
    const projectSelect = page.locator('#project');
    await expect(projectSelect).toBeVisible({ timeout: 8000 });
    await projectSelect.click();

    // Collect all option labels
    const options = page.locator('.p-select-option');
    await expect(options.first()).toBeVisible({ timeout: 5000 });

    const labels = await options.allTextContents();
    const trimmed = labels.map(l => l.trim()).filter(Boolean);

    // Backend MEMBER is only in GTN — no other project should appear
    expect(trimmed).toContain('GTN');
    expect(trimmed.length).toBe(1);
  });
});
