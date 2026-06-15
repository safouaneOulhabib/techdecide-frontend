import { test, expect } from '@playwright/test';
import { getToken, createProjectApi, assignTeamToProjectApi, deleteProjectApi } from '../helpers';

test.use({ storageState: 'e2e/.auth/admin.json' });

const BACKEND_TEAM_ID = 1;
const ORG_ID = 1;

test.describe('Projects — APP_ADMIN', () => {

  test('can view the projects list page', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('h2')).toBeVisible({ timeout: 5000 });
  });

  test('Create Project button is visible', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('button', { name: /new project/i })).toBeVisible({ timeout: 5000 });
  });

  test('can create a project via UI', async ({ page }) => {
    const uid = Date.now();
    const name = `E2E Admin Project ${uid}`;
    await page.goto('/projects');
    await page.getByRole('button', { name: /new project/i }).click();
    await page.locator('#projectName').fill(name);
    // Select org via p-select
    await page.locator('#projectOrg').click();
    await page.locator('.p-select-option').first().click();
    await page.getByRole('button', { name: /^create$/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('tr').filter({ hasText: name })).toBeVisible({ timeout: 8000 });
    // Cleanup via API
    const adminToken = getToken('admin');
    const row = page.locator('tr').filter({ hasText: name }).first();
    await row.locator('button.btn-view').click();
    const url = page.url();
    const projectId = Number(url.match(/\/projects\/(\d+)/)?.[1]);
    if (projectId) await deleteProjectApi(page, adminToken, projectId);
  });

  test('can create a project via API and see it in the list', async ({ page }) => {
    const uid = Date.now();
    const adminToken = getToken('admin');
    const projectId = await createProjectApi(page, adminToken, `E2E API Project ${uid}`, ORG_ID);
    try {
      await page.goto('/projects');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('tr').filter({ hasText: `E2E API Project ${uid}` }))
        .toBeVisible({ timeout: 8000 });
    } finally {
      await deleteProjectApi(page, adminToken, projectId);
    }
  });

  test('can assign teams to a project', async ({ page }) => {
    const uid = Date.now();
    const adminToken = getToken('admin');
    const projectId = await createProjectApi(page, adminToken, `E2E Team Assign ${uid}`, ORG_ID);
    try {
      await page.goto(`/projects/${projectId}`);
      await page.waitForLoadState('networkidle');
      await assignTeamToProjectApi(page, adminToken, projectId, BACKEND_TEAM_ID);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('tr, .team-row').filter({ hasText: /backend team/i }))
        .toBeVisible({ timeout: 8000 });
    } finally {
      await deleteProjectApi(page, adminToken, projectId);
    }
  });

  test('can navigate to project detail', async ({ page }) => {
    const uid = Date.now();
    const adminToken = getToken('admin');
    const projectId = await createProjectApi(page, adminToken, `E2E Detail Nav ${uid}`, ORG_ID);
    try {
      await page.goto(`/projects/${projectId}`);
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 8000 });
    } finally {
      await deleteProjectApi(page, adminToken, projectId);
    }
  });

  test('seeded GTN project is visible', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('tr').filter({ hasText: /GTN/i })).toBeVisible({ timeout: 8000 });
  });

});
