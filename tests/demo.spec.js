import { test, expect } from '@playwright/test';
import { expectNoA11yViolations } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('enhances every component on the demo page', async ({ page }) => {
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('button').first()).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await expect(page.getByRole('tablist')).toBeVisible();
  await expect(page.getByRole('combobox')).toBeVisible();
  await expect(page.locator('[data-accordion-heading] > button').first()).toBeVisible();
  await page.getByRole('button', { name: 'Size guide' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
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
  await page.setViewportSize({ width: 375, height: 812 });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});
