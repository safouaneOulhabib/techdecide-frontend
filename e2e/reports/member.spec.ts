import { test, expect } from '@playwright/test';
import {
  getToken,
  createDecisionApi,
  deleteDecisionApi,
  createReportApi,
  deleteReportApi,
} from '../helpers';

test.use({ storageState: 'e2e/.auth/backend-member.json' });

const GTN_PROJECT_ID = 1;
const BACKEND_TEAM_ID = 1;

test.describe('Reports — MEMBER1 (project-scoped)', () => {

  test('can view reports list', async ({ page }) => {
    await page.goto('/reports');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('h2')).toBeVisible({ timeout: 5000 });
  });

  test('New Report button visible (has team)', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByRole('button', { name: /new report/i })).toBeVisible({ timeout: 5000 });
  });

  test('can create a report via UI (project selector → decision picker → submit)', async ({ page }) => {
    const uid = Date.now();
    const token = getToken('backend-member');
    const decisionId = await createDecisionApi(page, token, {
      title: `E2E M1 Report Decision ${uid}`,
      context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    try {
      await page.goto('/reports/new');

      // Select the GTN project
      await page.locator('#report-project').click();
      await page.locator('.p-select-option').filter({ hasText: /GTN/i }).click();

      // Fill title
      await page.locator('#report-title').fill(`E2E M1 Report ${uid}`);

      // Decision picker should now show our decision — select it
      await page.locator('.picker-item').filter({ hasText: `E2E M1 Report Decision ${uid}` })
        .waitFor({ state: 'visible', timeout: 10000 });
      await page.locator('.picker-item').filter({ hasText: `E2E M1 Report Decision ${uid}` }).click();

      await page.locator('.btn-action.btn-primary').click();
      await page.waitForURL(/\/reports\/\d+/, { timeout: 10000 });
      await expect(page.locator(`text=E2E M1 Report ${uid}`)).toBeVisible({ timeout: 5000 });

      const reportId = Number(page.url().match(/\/reports\/(\d+)/)?.[1]);
      if (reportId) await deleteReportApi(page, token, reportId);
    } finally {
      await deleteDecisionApi(page, token, decisionId);
    }
  });

  test('report card shows project name chip', async ({ page }) => {
    const uid = Date.now();
    const token = getToken('backend-member');
    const decisionId = await createDecisionApi(page, token, {
      title: `E2E M1 Card Chip Dec ${uid}`,
      context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    const reportId = await createReportApi(page, token, `E2E M1 Card Chip Report ${uid}`, [decisionId], GTN_PROJECT_ID);
    try {
      await page.goto('/reports');
      await page.waitForLoadState('networkidle');
      const card = page.locator('.report-card').filter({ hasText: `E2E M1 Card Chip Report ${uid}` }).first();
      await card.waitFor({ state: 'visible', timeout: 10000 });
      await expect(card.locator('.meta-chip--project')).toBeVisible();
      await expect(card.locator('.meta-chip--project')).toContainText(/GTN/i);
    } finally {
      await deleteReportApi(page, token, reportId);
      await deleteDecisionApi(page, token, decisionId);
    }
  });

  test('report detail shows project name chip', async ({ page }) => {
    const uid = Date.now();
    const token = getToken('backend-member');
    const decisionId = await createDecisionApi(page, token, {
      title: `E2E M1 Detail Chip Dec ${uid}`,
      context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    const reportId = await createReportApi(page, token, `E2E M1 Detail Chip Report ${uid}`, [decisionId], GTN_PROJECT_ID);
    try {
      await page.goto(`/reports/${reportId}`);
      await page.waitForSelector('.doc-meta', { timeout: 8000 });
      await expect(page.locator('.meta-chip--project')).toBeVisible();
      await expect(page.locator('.meta-chip--project')).toContainText(/GTN/i);
    } finally {
      await deleteReportApi(page, token, reportId);
      await deleteDecisionApi(page, token, decisionId);
    }
  });

  test('can edit own report title', async ({ page }) => {
    const uid = Date.now();
    const token = getToken('backend-member');
    const decisionId = await createDecisionApi(page, token, {
      title: `E2E M1 Edit Report Dec ${uid}`,
      context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    const reportId = await createReportApi(page, token, `E2E M1 Edit Report ${uid}`, [decisionId], GTN_PROJECT_ID);
    try {
      await page.goto(`/reports/${reportId}`);
      await page.getByRole('button', { name: /edit/i }).click();
      await page.locator('.edit-panel input[type="text"]').fill(`E2E M1 Edit Report ${uid} Updated`);
      await page.getByRole('button', { name: /save/i }).click();
      await expect(page.locator(`text=E2E M1 Edit Report ${uid} Updated`)).toBeVisible({ timeout: 5000 });
    } finally {
      await deleteReportApi(page, token, reportId);
      await deleteDecisionApi(page, token, decisionId);
    }
  });

  test('can delete own report', async ({ page }) => {
    const uid = Date.now();
    const token = getToken('backend-member');
    const decisionId = await createDecisionApi(page, token, {
      title: `E2E M1 Del Report Dec ${uid}`,
      context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    const reportId = await createReportApi(page, token, `E2E M1 Del Report ${uid}`, [decisionId], GTN_PROJECT_ID);
    try {
      await page.goto('/reports');
      const card = page.locator('.report-card').filter({ hasText: `E2E M1 Del Report ${uid}` }).first();
      await card.waitFor({ state: 'visible', timeout: 8000 });
      await card.locator('.btn-delete').click();
      await page.getByRole('button', { name: /delete|confirm|yes|ok/i }).click({ timeout: 3000 }).catch(() => null);
      await expect(page.locator('.report-card').filter({ hasText: `E2E M1 Del Report ${uid}` }))
        .not.toBeVisible({ timeout: 5000 });
    } finally {
      await deleteDecisionApi(page, token, decisionId);
    }
  });

  test('cannot edit or delete another users report', async ({ page }) => {
    const adminToken = getToken('admin');
    const decisionId = await createDecisionApi(page, adminToken, {
      title: 'E2E Admin Report Dec', context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    const reportId = await createReportApi(page, adminToken, 'E2E Admin Report', [decisionId], GTN_PROJECT_ID);
    try {
      await page.goto(`/reports/${reportId}`);
      await expect(page.getByRole('button', { name: /edit/i })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /delete/i })).not.toBeVisible();
    } finally {
      await deleteReportApi(page, adminToken, reportId);
      await deleteDecisionApi(page, adminToken, decisionId);
    }
  });

});

// Devops member (also in GTN project) can view the report
test.describe('Reports — DEVOPS_MEMBER can view GTN report', () => {
  test.use({ storageState: 'e2e/.auth/devops-member.json' });

  test('devops-member sees report from same project (GTN)', async ({ page }) => {
    const backendToken = getToken('backend-member');
    const adminToken = getToken('admin');
    const uid = Date.now();
    const decisionId = await createDecisionApi(page, backendToken, {
      title: `E2E Devops View Dec ${uid}`,
      context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    const reportId = await createReportApi(page, backendToken, `E2E Devops View Report ${uid}`, [decisionId], GTN_PROJECT_ID);
    try {
      await page.goto(`/reports/${reportId}`);
      await expect(page.locator('h1')).toContainText(`E2E Devops View Report ${uid}`, { timeout: 8000 });
    } finally {
      await deleteReportApi(page, adminToken, reportId);
      await deleteDecisionApi(page, adminToken, decisionId);
    }
  });
});

// No-team user cannot create or view reports
test.describe('Reports — NO_TEAM access control', () => {
  test.use({ storageState: 'e2e/.auth/no-team.json' });

  test('no-team user is redirected or sees 403 on report detail', async ({ page }) => {
    const backendToken = getToken('backend-member');
    const adminToken = getToken('admin');
    const uid = Date.now();
    const decisionId = await createDecisionApi(page, backendToken, {
      title: `E2E NoTeam Report Dec ${uid}`,
      context: 'ctx', decision: 'dec',
      projectId: GTN_PROJECT_ID, teamIds: [BACKEND_TEAM_ID],
    });
    const reportId = await createReportApi(page, backendToken, `E2E NoTeam Report ${uid}`, [decisionId], GTN_PROJECT_ID);
    try {
      await page.goto(`/reports/${reportId}`);
      // No-team users should not see report content — either empty state or redirect
      await expect(page.locator('h1')).not.toBeVisible({ timeout: 5000 });
    } finally {
      await deleteReportApi(page, adminToken, reportId);
      await deleteDecisionApi(page, adminToken, decisionId);
    }
  });
});
