import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './tests/Browser',
    timeout: 60000,
    workers: 1,
    reporter: 'list',
    use: { baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:8000', channel: process.env.PLAYWRIGHT_CHANNEL || undefined, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
        { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
    ],
});

