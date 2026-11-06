import { test, expect } from '@playwright/test';
import { expectNoA11yViolations } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/tabs.html');
});

const tab = (page, name) => page.getByRole('tab', { name, exact: true });

test('builds a labelled tab list with one tab per section', async ({ page }) => {
  const tablist = page.getByRole('tablist', { name: 'Product details' });
  await expect(tablist.getByRole('tab')).toHaveText(['Overview', 'Specs', 'Shipping']);
});

test('selects the first tab and shows only its panel', async ({ page }) => {
  await expect(tab(page, 'Overview')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
  await expect(page.getByText('18 liters, 1.2 kilograms.')).toBeHidden();
});

test('clicking a tab selects it and shows its panel', async ({ page }) => {
  await tab(page, 'Specs').click();
  await expect(tab(page, 'Specs')).toHaveAttribute('aria-selected', 'true');
  await expect(tab(page, 'Overview')).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByRole('tabpanel', { name: 'Specs' })).toBeVisible();
  await expect(page.getByText('Waxed canvas, built for daily carry.')).toBeHidden();
});

test('arrow keys move selection and wrap at the ends', async ({ page }) => {
  await tab(page, 'Overview').focus();
  await page.keyboard.press('ArrowRight');
  await expect(tab(page, 'Specs')).toBeFocused();
  await expect(tab(page, 'Specs')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('18 liters, 1.2 kilograms.')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(tab(page, 'Overview')).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(tab(page, 'Shipping')).toBeFocused();
  await expect(tab(page, 'Shipping')).toHaveAttribute('aria-selected', 'true');
});

test('Home and End select the first and last tab', async ({ page }) => {
  await tab(page, 'Overview').focus();
  await page.keyboard.press('End');
  await expect(tab(page, 'Shipping')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(tab(page, 'Overview')).toHaveAttribute('aria-selected', 'true');
  await expect(tab(page, 'Overview')).toBeFocused();
});

test('only the selected tab is in the tab sequence', async ({ page }) => {
  await expect(tab(page, 'Overview')).toHaveAttribute('tabindex', '0');
  await expect(tab(page, 'Specs')).toHaveAttribute('tabindex', '-1');
  await tab(page, 'Specs').click();
  await expect(tab(page, 'Specs')).toHaveAttribute('tabindex', '0');
  await expect(tab(page, 'Overview')).toHaveAttribute('tabindex', '-1');
});

test('Tab moves from the selected tab into its panel', async ({ page }) => {
  await tab(page, 'Overview').focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('tabpanel', { name: 'Overview' })).toBeFocused();
});

test('has no WCAG violations', async ({ page }) => {
  await expectNoA11yViolations(page);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every section shows with its heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Specs' })).toBeVisible();
    await expect(page.getByText('18 liters, 1.2 kilograms.')).toBeVisible();
    await expect(page.getByText('Free shipping on orders over 75 dollars.')).toBeVisible();
  });
});
