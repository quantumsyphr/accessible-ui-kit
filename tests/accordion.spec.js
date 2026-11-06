import { test, expect } from '@playwright/test';
import { expectNoA11yViolations } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/accordion.html');
});

const header = (page, name) => page.getByRole('button', { name, exact: true });

test('turns each heading into a collapsed toggle button', async ({ page }) => {
  const buttons = page.locator('#faq').getByRole('button');
  await expect(buttons).toHaveText(['Shipping', 'Returns', 'Warranty']);
  for (const button of await buttons.all()) {
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  }
  await expect(page.getByText('Orders ship within two business days.')).toBeHidden();
});

test('keeps the heading around the button so heading navigation still works', async ({ page }) => {
  const heading = page.getByRole('heading', { level: 2, name: 'Shipping' });
  await expect(heading.getByRole('button', { name: 'Shipping' })).toBeVisible();
});

test('clicking a header expands its panel and clicking again collapses it', async ({ page }) => {
  const text = page.getByText('Orders ship within two business days.');
  await header(page, 'Shipping').click();
  await expect(header(page, 'Shipping')).toHaveAttribute('aria-expanded', 'true');
  await expect(text).toBeVisible();
  await header(page, 'Shipping').click();
  await expect(header(page, 'Shipping')).toHaveAttribute('aria-expanded', 'false');
  await expect(text).toBeHidden();
});

test('an expanded panel is a region named by its header', async ({ page }) => {
  await header(page, 'Returns').click();
  await expect(page.getByRole('region', { name: 'Returns' })).toBeVisible();
});

test('Enter and Space toggle the focused header', async ({ page }) => {
  await header(page, 'Warranty').focus();
  await page.keyboard.press('Enter');
  await expect(header(page, 'Warranty')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Space');
  await expect(header(page, 'Warranty')).toHaveAttribute('aria-expanded', 'false');
});

test('arrow keys move focus between headers and wrap at the ends', async ({ page }) => {
  await header(page, 'Shipping').focus();
  await page.keyboard.press('ArrowDown');
  await expect(header(page, 'Returns')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(header(page, 'Warranty')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(header(page, 'Shipping')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(header(page, 'Warranty')).toBeFocused();
});

test('Home and End jump to the first and last header', async ({ page }) => {
  await header(page, 'Returns').focus();
  await page.keyboard.press('End');
  await expect(header(page, 'Warranty')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(header(page, 'Shipping')).toBeFocused();
});

test('find in page can reveal a collapsed panel', async ({ page }) => {
  await page.locator('#faq [data-accordion-panel]').nth(1).dispatchEvent('beforematch');
  await expect(header(page, 'Returns')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('Return anything unused within 30 days.')).toBeVisible();
});

test('data-single keeps at most one panel open', async ({ page }) => {
  await header(page, 'Pickup').click();
  await header(page, 'Delivery').click();
  await expect(header(page, 'Pickup')).toHaveAttribute('aria-expanded', 'false');
  await expect(header(page, 'Delivery')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('Pick up in store the same day.')).toBeHidden();
});

test('has no WCAG violations collapsed or expanded', async ({ page }) => {
  await expectNoA11yViolations(page);
  await header(page, 'Shipping').click();
  await expectNoA11yViolations(page);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every panel stays readable', async ({ page }) => {
    await expect(page.getByText('Orders ship within two business days.')).toBeVisible();
    await expect(page.getByText('Two-year warranty on every pack.')).toBeVisible();
  });
});
