import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';

const users = [
  { email: 'admin@techdecide.com',                  file: 'admin' },
  { email: 'teamadmin.backend@techdecide.com',       file: 'backend-admin' },
  { email: 'member.backend@techdecide.com',          file: 'backend-member' },
  { email: 'teamadmin.devops@techdecide.com',        file: 'devops-admin' },
  { email: 'noteam@techdecide.com',                  file: 'no-team' },
];

fs.mkdirSync('e2e/.auth', { recursive: true });

for (const user of users) {
  setup(`authenticate ${user.email}`, async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill('Test1234!');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await expect(page).toHaveURL(/decisions/, { timeout: 8000 });
    await page.context().storageState({ path: `e2e/.auth/${user.file}.json` });
  });
}
