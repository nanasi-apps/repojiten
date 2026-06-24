import { expect, test } from '@playwright/test';

test.describe('Repojiten app shell', () => {
  test('root route が Repojiten を識別できる', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Repojiten/);
    await expect(page.getByRole('link', { name: 'Repojiten' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Repojiten' })).toBeVisible();
  });
});
