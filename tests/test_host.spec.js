import { test, expect } from '@playwright/test';
const fs = require("fs");
const url = require("url");
const path = require("path");

test('CreateAndLeaveLobby', async ({ page }) => {
  await page.coverage.startJSCoverage();

  await page.goto('http://localhost:8080/');

  await page.getByText('OTTOMHCreate new lobbyJoin lobby').click();
  
  await page.getByRole('button', { name: 'Create new lobby' }).click();

  await page.getByPlaceholder('Username').fill('Landen');

  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByPlaceholder('Username').press('Enter');
  await expect(page).toHaveURL(/http:\/\/localhost:8080\/lobbies\/[a-zA-Z0-9]{6}/);

  await page.getByRole('button', { name: 'Leave Lobby' }).click();
  await expect(page).toHaveURL('http://localhost:8080/');

  await page.getByRole('button', { name: 'Create new lobby' }).click();
  await page.getByPlaceholder('Username').fill('testhost');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(/http:\/\/localhost:8080\/lobbies\/[a-zA-Z0-9]{6}/);
  let path_comps = page.url().split('/');
  let id = path_comps[path_comps.length - 1];
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Copy Room Code' }).click();
  await page.getByRole('button', { name: 'Leave Lobby' }).click();
  await expect(page).toHaveURL('http://localhost:8080/');
  await page.getByRole('button', { name: 'Join lobby' }).click();
  await page.getByPlaceholder('Username').fill('testuser');
  await page.getByPlaceholder('Lobby code').click();
  await page.getByPlaceholder('Lobby code').fill(id);
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(/http:\/\/localhost:8080\/lobbies\/[a-zA-Z0-9]{6}/);
  await page.getByRole('button', { name: 'Leave Lobby' }).click();
  await expect(page).toHaveURL('http://localhost:8080/');
  await page.getByRole('button', { name: 'Create new lobby' }).click();
  await page.getByPlaceholder('Username').fill('testhost');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(/http:\/\/localhost:8080\/lobbies\/[a-zA-Z0-9]{6}/);
  await page.getByRole('button', { name: 'Start' }).click();

  const ele = await page.getByPlaceholder('theLetter').inputValue();

  await page.getByPlaceholder('Enter Answer Here').click();
  await page.getByPlaceholder('Enter Answer Here').fill(ele+'testenter');
  await page.getByPlaceholder('Enter Answer Here').press('Enter');
  await page.getByPlaceholder('Enter Answer Here').fill(ele+'testsubmit');
  await page.getByPlaceholder('Enter Answer Here').press('Enter');

  await page.getByRole('button', { name: ele+'testenter' }).click();
  await page.getByRole('button', { name: ele+'testenter' }).click();


  await page.getByRole('button', { name: 'Return to Lobby' }).click();
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByPlaceholder('Enter Answer Here').click();
  await page.getByPlaceholder('Enter Answer Here').fill('gamestartsuccess');
  await page.getByPlaceholder('Enter Answer Here').press('Enter');

  // Courtesy of jfgreffier: https://github.com/microsoft/playwright/issues/9208#issuecomment-1147884893
  // Get and save V8 coverage
  const coverage = await page.coverage.stopJSCoverage();
  const rootPath = path.normalize(`${__dirname}/../build`);
  const coverageWithPath = coverage.map((entry) => {
    const fileName = new url.URL(entry.url).pathname;
    return { ...entry, url: `file:///${rootPath}${fileName}` };
  });

  fs.writeFileSync(
    "coverage678.json",
    JSON.stringify({ result: coverageWithPath }, null, 2)
  );
});
