import { test, expect } from '@playwright/test';
import { expectNoA11yViolations } from './helpers.js';

async function sidewaysOverflow(page) {
  await page.setViewportSize({ width: 375, height: 812 });
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.describe('with JavaScript on', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('enhances every component on the demo page', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('button').first()).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(page.getByRole('tablist')).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Find a store near you' })).toBeVisible();
    await expect(page.locator('[data-accordion-heading] > button').first()).toBeVisible();
    await expect(page.locator('[data-carousel-controls] button')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Size guide' }).click();
    await expect(page.getByRole('dialog', { name: 'Size guide' })).toBeVisible();
  });

  test('lists what is wrong when the form is sent empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Notify me' }).click();
    const summary = page.locator('[data-form-summary]');
    await expect(summary).toBeFocused();
    await expect(summary.getByRole('link')).toHaveCount(3);
    await expect(page.locator('.form-status')).toBeEmpty();
  });

  test('opens the shop menu as a drawer', async ({ page }) => {
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Shop' }).getByRole('link', { name: 'Packs' })).toBeVisible();
  });

  test('marks JavaScript as on', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'JavaScript on' })).toHaveAttribute('aria-current', 'true');
    await expect(page.getByRole('link', { name: 'JavaScript off' })).not.toHaveAttribute('aria-current');
  });

  test('has no WCAG violations in light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await expectNoA11yViolations(page);
  });

  test('has no WCAG violations in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await expectNoA11yViolations(page);
  });

  test('fits a phone screen without sideways scrolling', async ({ page }) => {
    expect(await sidewaysOverflow(page)).toBe(0);
  });
});

test.describe('with JavaScript off', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?nojs');
  });

  test('leaves every component as plain HTML', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'JavaScript off' })).toHaveAttribute('aria-current', 'true');
    await expect(page.locator('[data-accordion-heading] > button')).toHaveCount(0);
    await expect(page.getByRole('tablist')).toHaveCount(0);
    await expect(page.locator('[data-carousel-controls]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Menu', exact: true })).toHaveCount(0);
  });

  test('keeps the content reachable', async ({ page }) => {
    await expect(page.locator('[data-accordion-panel]').first()).toBeVisible();
    await expect(page.locator('[data-tab-panel]').last()).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Shop' }).getByRole('link', { name: 'Packs' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Daypack colors' }).getByText('Harbor')).toBeAttached();
  });

  test('still opens the dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Size guide' }).click();
    await expect(page.getByRole('dialog', { name: 'Size guide' })).toBeVisible();
  });

  test('lets the browser check the form', async ({ page }) => {
    await page.getByRole('button', { name: 'Notify me' }).click();
    await expect(page.locator('[data-form-summary]')).toHaveCount(0);
    await expect(page.locator('.form-status')).toBeEmpty();
    expect(await page.locator('#notify-email').evaluate((input) => input.validity.valueMissing)).toBe(true);
  });

  test('has no WCAG violations in light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await expectNoA11yViolations(page);
  });

  test('has no WCAG violations in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await expectNoA11yViolations(page);
  });

  test('fits a phone screen without sideways scrolling', async ({ page }) => {
    expect(await sidewaysOverflow(page)).toBe(0);
  });
});
