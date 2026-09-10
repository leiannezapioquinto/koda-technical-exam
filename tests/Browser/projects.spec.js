import { test, expect } from '@playwright/test';
test('account and project lifecycle works with accessible dialogs', async ({ page }, testInfo) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const email = 'e2e-' + Date.now() + '-' + testInfo.project.name + '@example.test';
    await page.goto('/');
    await page.getByRole('button', { name: 'Create an account' }).click();
    await page.getByLabel('Full name').fill('Taylor Test');
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('StrongPassword2026');
    await page.getByLabel('Confirm password').fill('StrongPassword2026');
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Project overview' })).toBeVisible();

    await page.getByRole('button', { name: 'New project' }).click();
    let dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel(/Client name/)).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: 'Close dialog' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'New project' })).toBeFocused();

    await page.getByRole('button', { name: 'New project' }).click();
    dialog = page.getByRole('dialog');
    await dialog.getByLabel(/Client name/).fill('Acme QA');
    await dialog.getByLabel(/Project name/).fill('Website launch');
    await dialog.getByLabel(/Description/).fill('A project created in a real browser.');
    await dialog.getByLabel(/Start date/).fill('2026-09-10');
    await dialog.getByLabel(/Due date/).fill('2026-10-10');
    await dialog.getByRole('button', { name: 'Create project' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Website launch', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Website launch', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Edit Website launch', exact: true }).click();
    dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel(/Project name/)).toHaveValue('Website launch');
    await dialog.getByLabel(/Project name/).fill('Website delivered');
    await dialog.getByLabel(/Status/).selectOption('Completed');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('button', { name: 'Website delivered', exact: true })).toBeVisible();
    await page.getByLabel('Filter by status').selectOption('Planning');
    await expect(page.getByText('No matching projects')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
    await page.getByRole('searchbox').fill('Acme QA');
    await expect(page.getByRole('button', { name: 'Website delivered', exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: '.runtime/' + testInfo.project.name + '-projects.png', fullPage: true });

    await page.getByRole('button', { name: 'Delete Website delivered', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('button', { name: 'Website delivered', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Delete Website delivered', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete project', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Website delivered', exact: true })).not.toBeVisible();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    expect(errors).toEqual([]);
});

