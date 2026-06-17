import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';

const users = [
  { email: 'admin@techdecide.com',                  file: 'admin' },
  { email: 'teamadmin.backend@techdecide.com',       file: 'backend-admin' },
  { email: 'member.backend@techdecide.com',          file: 'backend-member' },
  { email: 'teamadmin.devops@techdecide.com',        file: 'devops-admin' },
  { email: 'member.devops@techdecide.com',           file: 'devops-member' },
  { email: 'noteam@techdecide.com',                  file: 'no-team' },
];

fs.mkdirSync('e2e/.auth', { recursive: true });

for (const user of users) {
  setup(`authenticate ${user.email}`, async ({ page }) => {
    // Dismiss Vite HMR error overlay if it appears during startup
    await page.addLocatorHandler(page.locator('vite-error-overlay'), async () => {
      await page.keyboard.press('Escape');
    });
    await page.goto('/auth/login');
    await page.locator('#email').fill(user.email);
    await page.locator('p-password input').fill('Test1234!');
    const signIn = page.getByRole('button', { name: /sign in/i });
    await expect(signIn).toBeEnabled({ timeout: 15000 });
    await signIn.click();
    await expect(page).toHaveURL(/decisions/, { timeout: 15000 });
    await page.context().storageState({ path: `e2e/.auth/${user.file}.json` });
  });
}
