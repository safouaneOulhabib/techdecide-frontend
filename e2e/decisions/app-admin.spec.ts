import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, deleteDecisionApi } from '../helpers';

test.use({ storageState: 'e2e/.auth/admin.json' });

const BACKEND_TEAM_ID = 1;
const DEVOPS_TEAM_ID = 2;

test.describe('Decisions — APP_ADMIN', () => {

  test('can see decisions from all teams', async ({ page }) => {
    const adminToken = getToken('admin');
    const backendMemberToken = getToken('backend-member');
    const devopsAdminToken = getToken('devops-admin');
    const uid = Date.now();

    const backendId = await createDecisionApi(page, backendMemberToken, {
      title: `E2E AppAdmin Backend ${uid}`, context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    const devopsId = await createDecisionApi(page, devopsAdminToken, {
      title: `E2E AppAdmin Devops ${uid}`, context: 'ctx', decision: 'dec', teamId: DEVOPS_TEAM_ID,
    });

    try {
      await page.goto('/decisions');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.decision-card').filter({ hasText: `E2E AppAdmin Backend ${uid}` }))
        .toBeVisible({ timeout: 12000 });
      await expect(page.locator('.decision-card').filter({ hasText: `E2E AppAdmin Devops ${uid}` }))
        .toBeVisible({ timeout: 8000 });
    } finally {
      await deleteDecisionApi(page, adminToken, backendId);
      await deleteDecisionApi(page, adminToken, devopsId);
    }
  });

  test('New Decision button NOT visible (APP_ADMIN has no team)', async ({ page }) => {
    await page.goto('/decisions');
    await expect(page.getByRole('button', { name: /new decision/i })).not.toBeVisible();
  });

  test('can view any decision detail regardless of team', async ({ page }) => {
    const adminToken = getToken('admin');
    const devopsAdminToken = getToken('devops-admin');
    const uid = Date.now();
    const id = await createDecisionApi(page, devopsAdminToken, {
      title: `E2E AppAdmin View Devops ${uid}`, context: 'ctx', decision: 'dec', teamId: DEVOPS_TEAM_ID,
    });
    try {
      await page.goto(`/decisions/${id}`);
      await expect(page.locator('h1')).toContainText(`E2E AppAdmin View Devops ${uid}`, { timeout: 8000 });
    } finally {
      await deleteDecisionApi(page, adminToken, id);
    }
  });

  test('team filter allows filtering to a specific team', async ({ page }) => {
    const adminToken = getToken('admin');
    const backendMemberToken = getToken('backend-member');
    const devopsAdminToken = getToken('devops-admin');
    const uid = Date.now();

    const backendId = await createDecisionApi(page, backendMemberToken, {
      title: `E2E AppAdmin TeamFilter Backend ${uid}`, context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    const devopsId = await createDecisionApi(page, devopsAdminToken, {
      title: `E2E AppAdmin TeamFilter Devops ${uid}`, context: 'ctx', decision: 'dec', teamId: DEVOPS_TEAM_ID,
    });

    try {
      await page.goto('/decisions');
      await page.waitForLoadState('networkidle');
      // Filter to Backend Team only
      await page.locator('.filters-bar').getByText('All Teams').click();
      await page.locator('.p-select-option').filter({ hasText: /backend team/i }).click();
      await page.waitForTimeout(300);

      await expect(page.locator('.decision-card').filter({ hasText: `E2E AppAdmin TeamFilter Backend ${uid}` }))
        .toBeVisible({ timeout: 8000 });
      await expect(page.locator('.decision-card').filter({ hasText: `E2E AppAdmin TeamFilter Devops ${uid}` }))
        .not.toBeVisible();
    } finally {
      await deleteDecisionApi(page, adminToken, backendId);
      await deleteDecisionApi(page, adminToken, devopsId);
    }
  });

});
