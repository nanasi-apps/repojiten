import { expect, test } from '@playwright/test';

test.describe('Repojiten initial route', () => {
  test('[REPOJITEN-FOUNDATION-FE-S001] root route が Repojiten を識別できる', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Repojiten/);
    await expect(page.getByRole('link', { name: 'Repojiten' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Repojiten' })).toBeVisible();
  });

  test('[REPOJITEN-FOUNDATION-FE-S002] sample UI が primary product entrypoint ではない', async ({
    page,
  }) => {
    await page.goto('/');

    const sampleUsersLink = page.getByRole('link', { name: 'Sample Users', exact: true });

    await expect(sampleUsersLink).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open sample Users' })).toBeVisible();
  });

  test('[REPOJITEN-FOUNDATION-FE-S005] E2E smoke が initial route を cover する', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByText('v0.1 foundation')).toBeVisible();
    await expect(page.getByText('API health')).toBeVisible();
    await expect(page.getByText('Foundation checks')).toBeVisible();
  });
});
