import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  timeout: 15000,

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },

  projects: [
    // Global setup runs first — logs in all users and saves sessions
    { name: 'setup', testMatch: /global\.setup\.ts/ },

    {
      name: 'admin',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/admin.json' },
      dependencies: ['setup'],
    },
    {
      name: 'backend-admin',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/backend-admin.json' },
      dependencies: ['setup'],
    },
    {
      name: 'backend-member',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/backend-member.json' },
      dependencies: ['setup'],
    },
    {
      name: 'devops-admin',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/devops-admin.json' },
      dependencies: ['setup'],
    },
    {
      name: 'no-team',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/no-team.json' },
      dependencies: ['setup'],
    },
  ],
});
