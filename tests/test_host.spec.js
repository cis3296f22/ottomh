import { test, expect } from '@playwright/test';
const fs = require("fs");
const url = require("url");
const path = require("path");

test('CreateAndLeaveLobby', async ({ page }) => {
  await page.coverage.startJSCoverage();

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

  // Courtesy of jfgreffier: https://github.com/microsoft/playwright/issues/9208#issuecomment-1147884893
  // Get and save V8 coverage
  const coverage = await page.coverage.stopJSCoverage();
  const rootPath = path.normalize(`${__dirname}/../build`);
  const coverageWithPath = coverage.map((entry) => {
    const fileName = new url.URL(entry.url).pathname;
    return { ...entry, url: `file:///${rootPath}${fileName}` };
  });

  fs.writeFileSync(
    "coverage/tmp/coverage.json",
    JSON.stringify({ result: coverageWithPath }, null, 2)
  );
});