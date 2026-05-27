import {expect, test} from '@playwright/test';

test('homepage loads', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
});

test('player token redirects root route to hub', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Choose your fighter:'})).toBeVisible();
  await page.evaluate(() => {
    localStorage.setItem('mt-player-token', 'smoke-test-token');
  });

  await page.goto('/');
  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.getByRole('button', {name: 'Hub'})).toHaveAttribute('aria-current', 'page');
});

test('choosing a fighter stores player token and routes to hub', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Choose your fighter:'})).toBeVisible();

  await page.getByRole('button', {name: 'CHOOSE'}).first().click();

  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.getByRole('button', {name: 'Hub'})).toHaveAttribute('aria-current', 'page');
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('mt-player-token'))).not.toBeNull();
  await expect(page.locator('dt').filter({hasText: 'Name'})).toBeVisible();
  await expect(page.getByText('Technique: Flying Knee Drill', {exact: true})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Leaderboard:'})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Trainable Stat Leaders:'})).toBeVisible();
});
