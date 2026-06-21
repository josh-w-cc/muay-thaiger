import {expect, test} from '@playwright/test';

test('homepage loads', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
});

test('player token redirects root route to hub', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'CHOOSE'}).first().click();
  await expect(page).toHaveURL(/\/hub$/);

  await page.goto('/');
  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.getByRole('button', {name: 'Hub'})).toHaveAttribute('aria-current', 'page');
});

test('hub route redirects to fighter select when no player token exists', async ({page}) => {
  await page.goto('/hub');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', {name: 'Choose your fighter:'})).toBeVisible();
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

test('server down route shows recovery messaging', async ({page}) => {
  await page.goto('/server-down');
  await expect(page).toHaveURL(/\/server-down$/);
  await expect(page.getByRole('heading', {name: 'Server Unavailable'})).toBeVisible();
  await expect(page.getByText(/unable to connect to the game server/i)).toBeVisible();
  await expect(page.getByRole('button', {name: 'Return Home'})).toBeVisible();
});

test('edit user route allows returning to hub for authenticated players', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'CHOOSE'}).first().click();
  await expect(page).toHaveURL(/\/hub$/);

  await page.goto('/edit-user');
  await expect(page).toHaveURL(/\/edit-user$/);
  await expect(page.getByRole('heading', {name: 'Check back later'})).toBeVisible();

  await page.getByRole('button', {name: 'Return to Hub'}).click();
  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.getByRole('button', {name: 'Hub'})).toHaveAttribute('aria-current', 'page');
});
