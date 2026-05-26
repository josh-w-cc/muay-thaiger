import {expect, test} from '@playwright/test';

test('hub page renders stats, events, and leaderboard after choosing a fighter', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Choose your fighter:'})).toBeVisible();

  await page.getByRole('button', {name: 'CHOOSE'}).first().click();

  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.getByRole('heading', {name: 'Stats:'})).toBeVisible();
  await expect(page.getByText('Technique: Flying Knee Drill')).toBeVisible();
  await expect(page.getByText('Lumpinee Rookie Cup')).toBeVisible();
  await expect(page.getByText('Camp Sparring Session')).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Leaderboard:'})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Trainable Stat Leaders:'})).toBeVisible();
  await expect(page.getByText('Iron Cobra')).toBeVisible();
});

test('hub page shows fighter details when player token is already set', async ({page, request}) => {
  await request.post('/api/test/reseed');

  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('mt-player-token', 'seed-token-ramrodrit'));
  await page.goto('/');

  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.getByText('RamrodRit Jr')).toBeVisible();
  await expect(page.getByText('Tiger')).toBeVisible();
});
