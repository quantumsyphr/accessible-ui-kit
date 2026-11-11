import { test, expect } from '@playwright/test';
import { expectNoA11yViolations } from './helpers.js';

test.describe('drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.goto('/tests/fixtures/drawer.html');
  });

  const opener = (page) => page.getByRole('button', { name: 'Menu' });
  const drawer = (page) => page.getByRole('dialog', { name: 'Shop' });

  test('shows the button and tucks the links away', async ({ page }) => {
    await expect(opener(page)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Packs' })).toBeHidden();
  });

  test('opens as a modal named after the navigation', async ({ page }) => {
    await opener(page).click();

    await expect(drawer(page)).toBeVisible();
    expect(await drawer(page).evaluate((el) => el.matches(':modal'))).toBe(true);
    await expect(drawer(page).getByRole('navigation', { name: 'Shop' }).getByRole('link')).toHaveCount(3);
  });

  test('moves focus inside when it opens', async ({ page }) => {
    await opener(page).click();

    await expect(drawer(page).getByRole('button', { name: 'Close' })).toBeFocused();
  });

  test('Escape closes it and returns focus to the button', async ({ page }) => {
    await opener(page).click();
    await page.keyboard.press('Escape');

    await expect(drawer(page)).toBeHidden();
    await expect(opener(page)).toBeFocused();
  });

  test('the Close button closes it and returns focus to the button', async ({ page }) => {
    await opener(page).click();
    await drawer(page).getByRole('button', { name: 'Close' }).click();

    await expect(drawer(page)).toBeHidden();
    await expect(opener(page)).toBeFocused();
  });

  test('following a link closes it', async ({ page }) => {
    await opener(page).click();
    await drawer(page).getByRole('link', { name: 'Bags' }).click();

    await expect(drawer(page)).toBeHidden();
    await expect(page).toHaveURL(/#bags$/);
  });

  test('makes the page behind inert and locks its scroll', async ({ page }) => {
    await opener(page).click();
    await page.locator('#outside').focus({ timeout: 1000 }).catch(() => {});

    await expect(page.locator('#outside')).not.toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
  });

  test('with a media query, is a drawer only while the query matches', async ({ page }) => {
    const help = page.getByRole('button', { name: 'Help' });
    const shipping = page.getByRole('link', { name: 'Shipping' });
    const inPage = () => page.locator('#help-menu').evaluate((el) => el.parentElement.tagName === 'MAIN');

    await expect(help).toBeHidden();
    await expect(shipping).toBeVisible();
    expect(await inPage()).toBe(true);

    await page.setViewportSize({ width: 500, height: 700 });
    await expect(help).toBeVisible();
    await expect(shipping).toBeHidden();

    await help.click();
    await expect(page.getByRole('dialog', { name: 'Help' })).toBeVisible();

    await page.setViewportSize({ width: 1000, height: 700 });
    await expect(page.getByRole('dialog', { name: 'Help' })).toBeHidden();
    await expect(help).toBeHidden();
    await expect(shipping).toBeVisible();
    expect(await inPage()).toBe(true);
  });

  test('has no axe violations closed or open', async ({ page }) => {
    await expectNoA11yViolations(page);

    await opener(page).click();
    await expect(drawer(page)).toBeVisible();
    await expectNoA11yViolations(page);
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('leaves the links on the page and the button hidden', async ({ page }) => {
      await expect(opener(page)).toBeHidden();
      await expect(page.getByRole('link', { name: 'Packs' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Shipping' })).toBeVisible();
    });
  });
});
