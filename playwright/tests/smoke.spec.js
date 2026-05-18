import {expect, test} from '@playwright/test';

test('homepage loads', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
});

test('player auth persists and redirects to hub', async ({page, request}) => {
  const reseedResponse = await request.post('/api/test/reseed');
  await expect(reseedResponse).toBeOK();

  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Choose your fighter:'})).toBeVisible();
  await page.getByRole('button', {name: 'CHOOSE'}).first().click();

  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.getByRole('heading', {name: 'HUB'})).toBeVisible();

  await page.goto('/');
  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.getByRole('heading', {name: 'HUB'})).toBeVisible();
});
