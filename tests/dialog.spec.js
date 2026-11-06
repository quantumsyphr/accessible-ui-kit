import { test, expect } from '@playwright/test';
import { expectNoA11yViolations } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/dialog.html');
});

const opener = (page) => page.getByRole('button', { name: 'Size guide' });
const dialog = (page) => page.getByRole('dialog', { name: 'Size guide' });

async function open(page) {
  await opener(page).click();
  await expect(dialog(page)).toBeVisible();
}

test('the opener shows a modal dialog named by its heading', async ({ page }) => {
  await open(page);
  expect(await dialog(page).evaluate((el) => el.matches(':modal'))).toBe(true);
});

test('focus moves into the dialog when it opens', async ({ page }) => {
  await open(page);
  const focusInside = await page.evaluate(() =>
    document.getElementById('size-guide').contains(document.activeElement),
  );
  expect(focusInside).toBe(true);
});

test('Escape closes the dialog and returns focus to the opener', async ({ page }) => {
  await open(page);
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  await expect(opener(page)).toBeFocused();
});

test('the close button closes the dialog and returns focus to the opener', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(dialog(page)).toBeHidden();
  await expect(opener(page)).toBeFocused();
});

test('clicking the backdrop closes the dialog', async ({ page }) => {
  await open(page);
  await page.mouse.click(8, 8);
  await expect(dialog(page)).toBeHidden();
});

test('clicking inside the dialog keeps it open', async ({ page }) => {
  await open(page);
  await page.getByText('Measure around the fullest part of your chest.').click();
  await expect(dialog(page)).toBeVisible();
});

test('the page behind cannot take focus while the dialog is open', async ({ page }) => {
  await open(page);
  const focusedId = await page.evaluate(() => {
    document.getElementById('outside').focus();
    return document.activeElement.id;
  });
  expect(focusedId).not.toBe('outside');
});

test('the page behind stops scrolling while the dialog is open', async ({ page }) => {
  const overflow = () => page.evaluate(() => getComputedStyle(document.documentElement).overflow);
  await open(page);
  expect(await overflow()).toBe('hidden');
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  expect(await overflow()).not.toBe('hidden');
});

test('has no WCAG violations while open', async ({ page }) => {
  await open(page);
  await expectNoA11yViolations(page);
});
