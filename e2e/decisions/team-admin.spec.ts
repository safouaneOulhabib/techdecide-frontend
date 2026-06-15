import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, updateStatusApi, deleteDecisionApi } from '../helpers';

test.use({ storageState: 'e2e/.auth/backend-admin.json' });

const GTN_PROJECT_ID = 1;
const BACKEND_TEAM_ID = 1;

test.describe('Decisions — TEAM_ADMIN1', () => {

  test('can view Backend Team decisions', async ({ page }) => {
    await page.goto('/decisions');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('h2')).toBeVisible({ timeout: 5000 });
  });

  test('can create a decision', async ({ page }) => {
    const uid = Date.now();
    const title = `E2E TA Create ${uid}`;
    await page.goto('/decisions/create');
    await page.locator('#title').fill(title);
    await page.locator('#context').fill('E2E context');
    await page.locator('#decision').fill('E2E decision body');
    await page.getByRole('button', { name: /create decision/i }).click();
    await page.waitForURL(/\/decisions$/, { timeout: 10000 });
    await expect(page.locator('.decision-card').filter({ hasText: title }).first()).toBeVisible();
    const card = page.locator('.decision-card').filter({ hasText: title }).first();
    await card.locator('.btn-delete').click();
    await page.getByRole('button', { name: /delete|confirm|yes|ok/i }).click({ timeout: 3000 }).catch(() => null);
  });

  test('status selector shows APPROVED and REJECTED options on PROPOSED decision', async ({ page }) => {
    const adminToken = getToken('admin');
    const id = await createDecisionApi(page, adminToken, {
      title: 'E2E TA Status Opts', context: 'ctx', decision: 'dec', projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    await updateStatusApi(page, adminToken, id, 'PROPOSED');
    try {
      await page.goto(`/decisions/${id}`);
      await expect(page.locator('.status-selector')).toBeVisible({ timeout: 5000 });
      await page.locator('.status-selector p-select').click();
      await expect(page.locator('.p-select-option').filter({ hasText: /^Approved$/ })).toBeVisible();
      await expect(page.locator('.p-select-option').filter({ hasText: /^Rejected$/ })).toBeVisible();
      await page.keyboard.press('Escape');
    } finally {
      await deleteDecisionApi(page, adminToken, id);
    }
  });

  test('can advance PROPOSED → APPROVED', async ({ page }) => {
    const adminToken = getToken('admin');
    const id = await createDecisionApi(page, adminToken, {
      title: 'E2E TA Approve', context: 'ctx', decision: 'dec', projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    await updateStatusApi(page, adminToken, id, 'PROPOSED');
    await page.goto(`/decisions/${id}`);
    await page.locator('.status-selector p-select').click();
    await page.locator('.p-select-option').filter({ hasText: /^Approved$/ }).click();
    await expect(page.locator('app-decision-status-badge').filter({ hasText: /APPROVED/i })).toBeVisible({ timeout: 5000 });
    // Best-effort cleanup of APPROVED decision
    await deleteDecisionApi(page, adminToken, id).catch(() => null);
  });

  test('can advance PROPOSED → REJECTED', async ({ page }) => {
    const adminToken = getToken('admin');
    const id = await createDecisionApi(page, adminToken, {
      title: 'E2E TA Reject', context: 'ctx', decision: 'dec', projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    await updateStatusApi(page, adminToken, id, 'PROPOSED');
    try {
      await page.goto(`/decisions/${id}`);
      await page.locator('.status-selector p-select').click();
      await page.locator('.p-select-option').filter({ hasText: /^Rejected$/ }).click();
      await expect(page.locator('app-decision-status-badge').filter({ hasText: /REJECTED/i })).toBeVisible({ timeout: 5000 });
    } finally {
      await deleteDecisionApi(page, adminToken, id);
    }
  });

  test('Supersede button visible on APPROVED decision for TEAM_ADMIN', async ({ page }) => {
    const adminToken = getToken('admin');
    const id = await createDecisionApi(page, adminToken, {
      title: 'E2E TA Sup Visible', context: 'ctx', decision: 'dec', projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    await updateStatusApi(page, adminToken, id, 'PROPOSED');
    await updateStatusApi(page, adminToken, id, 'APPROVED');
    await page.goto(`/decisions/${id}`);
    await expect(page.getByRole('button', { name: /supersede/i })).toBeVisible({ timeout: 5000 });
    await deleteDecisionApi(page, adminToken, id).catch(() => null);
  });

});
