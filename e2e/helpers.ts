import { Page } from '@playwright/test';

export async function createDraftDecision(page: Page, title: string, teamId = 1): Promise<string> {
  await page.goto('/decisions/new');
  await page.getByLabel(/title/i).fill(title);
  await page.getByLabel(/context/i).fill('Test context');
  await page.getByLabel(/decision/i).first().fill('Test decision body');
  // Pick the first available team if a team selector exists
  const teamSelect = page.locator('[formcontrolname="teamId"], [name="teamId"]').first();
  if (await teamSelect.isVisible()) await teamSelect.selectOption({ index: 0 });
  await page.getByRole('button', { name: /save|create|submit/i }).click();
  await page.waitForURL(/decisions\/\d+/);
  return page.url();
}

export async function advanceStatus(page: Page, status: string) {
  const selector = page.getByRole('combobox').filter({ hasText: /draft|proposed|approved/i }).first();
  await selector.selectOption(status);
  const confirm = page.getByRole('button', { name: /confirm|ok|yes/i });
  if (await confirm.isVisible({ timeout: 1000 }).catch(() => false)) await confirm.click();
}
