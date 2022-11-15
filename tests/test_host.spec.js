import { test, expect } from '@playwright/test';
const v8toIstanbul = require('v8-to-istanbul');
const fs = require('fs');

test('CreateAndLeaveLobby', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  await page.getByText('OTTOMHCreate new lobbyJoin lobby').click();

  await page.getByPlaceholder('Username').fill('Landen');

  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByPlaceholder('Username').press('Enter');
  await expect(page).toHaveURL(/http:\/\/localhost:8080\/lobbies\/[a-zA-Z0-9]{6}/);

  await page.getByRole('button', { name: 'Leave Lobby' }).click();
  await expect(page).toHaveURL('http://localhost:8080/');
});