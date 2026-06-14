import { test, expect } from '@playwright/test';
import { getToken, createDecisionApi, updateStatusApi, deleteDecisionApi } from '../helpers';

test.use({ storageState: 'e2e/.auth/backend-member.json' });

const BACKEND_TEAM_ID = 1;

test.describe('Decisions — MEMBER1', () => {

  test('can view decisions list without redirect', async ({ page }) => {
    await page.goto('/decisions');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('h2')).toBeVisible({ timeout: 5000 });
  });

  test('decision list shows no Devops Team cards (team-scoped)', async ({ page }) => {
    await page.goto('/decisions');
    await page.waitForTimeout(1500);
    await expect(page.locator('.decision-card').filter({ hasText: 'Devops Team' })).toHaveCount(0);
  });

  test('New Decision button visible (has team)', async ({ page }) => {
    await page.goto('/decisions');
    await expect(page.getByRole('button', { name: /new decision/i })).toBeVisible({ timeout: 5000 });
  });

  test('can create a DRAFT decision (team auto-selected)', async ({ page }) => {
    const uid = Date.now();
    const title = `E2E M1 Create ${uid}`;
    await page.goto('/decisions/create');
    await page.locator('#title').fill(title);
    await page.locator('#context').fill('E2E context');
    await page.locator('#decision').fill('E2E decision body');
    await page.getByRole('button', { name: /create decision/i }).click();
    await page.waitForURL(/\/decisions$/, { timeout: 10000 });
    await expect(page.locator('.decision-card').filter({ hasText: title }).first()).toBeVisible();
    // Cleanup
    const card = page.locator('.decision-card').filter({ hasText: title }).first();
    await card.locator('.btn-delete').click();
    await page.getByRole('button', { name: /delete|confirm|yes|ok/i }).click({ timeout: 3000 }).catch(() => null);
    await expect(page.locator('.decision-card').filter({ hasText: title })).not.toBeVisible({ timeout: 5000 });
  });

  test('status selector visible on DRAFT shows only Proposed option', async ({ page }) => {
    const token = getToken('backend-member');
    const id = await createDecisionApi(page, token, {
      title: 'E2E M1 Status Options', context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    try {
      await page.goto(`/decisions/${id}`);
      await expect(page.locator('.status-selector')).toBeVisible({ timeout: 5000 });
      await page.locator('.status-selector p-select').click();
      await expect(page.locator('.p-select-option').filter({ hasText: /^Proposed$/ })).toBeVisible();
      await expect(page.locator('.p-select-option').filter({ hasText: /^Approved$/ })).not.toBeVisible();
      await expect(page.locator('.p-select-option').filter({ hasText: /^Rejected$/ })).not.toBeVisible();
      await page.keyboard.press('Escape');
    } finally {
      await deleteDecisionApi(page, token, id);
    }
  });

  test('can advance DRAFT → PROPOSED via status selector', async ({ page }) => {
    const token = getToken('backend-member');
    const adminToken = getToken('admin');
    const id = await createDecisionApi(page, token, {
      title: 'E2E M1 Advance', context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    try {
      await page.goto(`/decisions/${id}`);
      await page.locator('.status-selector p-select').click();
      await page.locator('.p-select-option').filter({ hasText: /^Proposed$/ }).click();
      await expect(page.locator('app-decision-status-badge').filter({ hasText: /PROPOSED/i })).toBeVisible({ timeout: 5000 });
    } finally {
      await deleteDecisionApi(page, adminToken, id);
    }
  });

  test('Supersede button NOT visible on APPROVED decision for MEMBER', async ({ page }) => {
    const adminToken = getToken('admin');
    const id = await createDecisionApi(page, adminToken, {
      title: 'E2E M1 Sup Guard', context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    await updateStatusApi(page, adminToken, id, 'PROPOSED');
    await updateStatusApi(page, adminToken, id, 'APPROVED');
    await page.goto(`/decisions/${id}`);
    await page.waitForSelector('app-decision-status-badge', { timeout: 5000 });
    await expect(page.getByRole('button', { name: /supersede/i })).not.toBeVisible();
    // Best-effort cleanup
    await deleteDecisionApi(page, adminToken, id).catch(() => null);
  });

  test('can edit own DRAFT decision', async ({ page }) => {
    const token = getToken('backend-member');
    const id = await createDecisionApi(page, token, {
      title: 'E2E M1 Edit', context: 'original ctx', decision: 'original dec', teamId: BACKEND_TEAM_ID,
    });
    try {
      await page.goto(`/decisions/${id}`);
      await page.locator('.btn-edit').click();
      await page.waitForURL(/\/decisions\/\d+\/edit/, { timeout: 5000 });
      await page.locator('#title').fill('E2E M1 Edit Updated');
      await page.getByRole('button', { name: /save changes/i }).click();
      await page.waitForURL(/\/decisions\/\d+$/, { timeout: 8000 });
      await expect(page.locator('h1')).toHaveText('E2E M1 Edit Updated');
    } finally {
      await deleteDecisionApi(page, token, id);
    }
  });

  test('edit button NOT visible on PROPOSED decision', async ({ page }) => {
    const memberToken = getToken('backend-member');
    const adminToken = getToken('admin');
    const id = await createDecisionApi(page, memberToken, {
      title: 'E2E M1 Edit Guard', context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    await updateStatusApi(page, adminToken, id, 'PROPOSED');
    try {
      await page.goto(`/decisions/${id}`);
      await expect(page.locator('.btn-edit')).not.toBeVisible();
    } finally {
      await deleteDecisionApi(page, adminToken, id);
    }
  });

  test('can delete own DRAFT decision via card', async ({ page }) => {
    const uid = Date.now();
    const title = `E2E M1 Delete ${uid}`;
    const token = getToken('backend-member');
    const id = await createDecisionApi(page, token, {
      title, context: 'ctx', decision: 'dec', teamId: BACKEND_TEAM_ID,
    });
    await page.goto('/decisions');
    await page.waitForLoadState('networkidle');
    const card = page.locator('.decision-card').filter({ hasText: title }).first();
    await card.waitFor({ state: 'visible', timeout: 10000 });
    await card.locator('.btn-delete').click();
    await page.getByRole('button', { name: /delete|confirm|yes|ok/i }).click({ timeout: 3000 }).catch(() => null);
    await expect(page.locator('.decision-card').filter({ hasText: title })).not.toBeVisible({ timeout: 5000 });
  });

});
