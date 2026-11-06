import { test, expect } from '@playwright/test';
import { expectNoA11yViolations } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/disclosure-nav.html');
});

const button = (page, name) =>
  page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name, exact: true });
const link = (page, name) => page.getByRole('link', { name, exact: true });

test('collapses every submenu on load', async ({ page }) => {
  await expect(button(page, 'Shop')).toHaveAttribute('aria-expanded', 'false');
  await expect(button(page, 'Support')).toHaveAttribute('aria-expanded', 'false');
  await expect(link(page, 'Packs')).toBeHidden();
  await expect(link(page, 'Home')).toBeVisible();
});

test('a button expands its submenu', async ({ page }) => {
  await button(page, 'Shop').click();
  await expect(button(page, 'Shop')).toHaveAttribute('aria-expanded', 'true');
  await expect(link(page, 'Packs')).toBeVisible();
});

test('opening one submenu closes the other', async ({ page }) => {
  await button(page, 'Shop').click();
  await button(page, 'Support').click();
  await expect(button(page, 'Shop')).toHaveAttribute('aria-expanded', 'false');
  await expect(link(page, 'Packs')).toBeHidden();
  await expect(link(page, 'Returns')).toBeVisible();
});

test('Escape closes the submenu and returns focus to its button', async ({ page }) => {
  await button(page, 'Shop').click();
  await link(page, 'Bags').focus();
  await page.keyboard.press('Escape');
  await expect(link(page, 'Bags')).toBeHidden();
  await expect(button(page, 'Shop')).toBeFocused();
});

test('focus leaving the navigation closes the submenu', async ({ page }) => {
  await button(page, 'Shop').click();
  await page.getByRole('button', { name: 'Elsewhere' }).focus();
  await expect(link(page, 'Packs')).toBeHidden();
  await expect(button(page, 'Shop')).toHaveAttribute('aria-expanded', 'false');
});

test('clicking outside the navigation closes the submenu', async ({ page }) => {
  await button(page, 'Shop').click();
  await page.getByRole('heading', { name: 'Disclosure navigation fixture' }).click();
  await expect(link(page, 'Packs')).toBeHidden();
});

test('arrow keys move from an open button through its links', async ({ page }) => {
  await button(page, 'Shop').focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await expect(link(page, 'Packs')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(link(page, 'Bags')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(link(page, 'Packs')).toBeFocused();
});

test('has no WCAG violations with a submenu open', async ({ page }) => {
  await button(page, 'Shop').click();
  await expectNoA11yViolations(page);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every link stays reachable', async ({ page }) => {
    await expect(link(page, 'Packs')).toBeVisible();
    await expect(link(page, 'Returns')).toBeVisible();
  });
});
