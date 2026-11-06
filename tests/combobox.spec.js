import { test, expect } from '@playwright/test';
import { expectNoA11yViolations } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/combobox.html');
});

const input = (page) => page.getByRole('combobox', { name: 'Find a store near you' });
const listbox = (page) => page.getByRole('listbox');
const option = (page, name) => page.getByRole('option', { name, exact: true });

test('upgrades the datalist input into a combobox', async ({ page }) => {
  await expect(input(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(input(page)).toHaveAttribute('aria-autocomplete', 'list');
  await expect(input(page)).not.toHaveAttribute('list');
});

test('typing shows only options with a word that starts with the text', async ({ page }) => {
  await input(page).fill('g');
  await expect(listbox(page).getByRole('option')).toHaveText(['Garland', 'Grand Prairie']);
  await expect(input(page)).toHaveAttribute('aria-expanded', 'true');
  await input(page).fill('wo');
  await expect(listbox(page).getByRole('option')).toHaveText(['Fort Worth']);
});

test('announces how many results are available', async ({ page }) => {
  await input(page).fill('g');
  await expect(page.getByRole('status')).toHaveText('2 results available.');
  await input(page).fill('fr');
  await expect(page.getByRole('status')).toHaveText('1 result available.');
});

test('ArrowDown highlights options while focus stays in the input', async ({ page }) => {
  await input(page).fill('g');
  await page.keyboard.press('ArrowDown');
  await expect(option(page, 'Garland')).toHaveAttribute('aria-selected', 'true');
  const activeId = await option(page, 'Garland').getAttribute('id');
  await expect(input(page)).toHaveAttribute('aria-activedescendant', activeId);
  await expect(input(page)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(option(page, 'Grand Prairie')).toHaveAttribute('aria-selected', 'true');
  await expect(option(page, 'Garland')).toHaveAttribute('aria-selected', 'false');
  await page.keyboard.press('ArrowDown');
  await expect(option(page, 'Garland')).toHaveAttribute('aria-selected', 'true');
});

test('ArrowUp from the first option wraps to the last', async ({ page }) => {
  await input(page).fill('g');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowUp');
  await expect(option(page, 'Grand Prairie')).toHaveAttribute('aria-selected', 'true');
});

test('ArrowDown on an empty input opens the full list', async ({ page }) => {
  await input(page).focus();
  await page.keyboard.press('ArrowDown');
  await expect(listbox(page).getByRole('option')).toHaveCount(10);
  await expect(option(page, 'Arlington')).toHaveAttribute('aria-selected', 'true');
});

test('Enter picks the highlighted option and closes the list', async ({ page }) => {
  await input(page).fill('g');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(input(page)).toHaveValue('Grand Prairie');
  await expect(listbox(page)).toBeHidden();
  await expect(input(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(input(page)).not.toHaveAttribute('aria-activedescendant');
});

test('picking an option fires a ui:select event with its value', async ({ page }) => {
  await page.evaluate(() => {
    document.getElementById('city').addEventListener('ui:select', (event) => {
      window.picked = event.detail.value;
    });
  });
  await input(page).fill('g');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => window.picked)).toBe('Garland');
});

test('clicking an option picks it', async ({ page }) => {
  await input(page).fill('d');
  await option(page, 'Denton').click();
  await expect(input(page)).toHaveValue('Denton');
  await expect(listbox(page)).toBeHidden();
  await expect(input(page)).toBeFocused();
});

test('Escape closes the list and a second Escape clears the input', async ({ page }) => {
  await input(page).fill('g');
  await page.keyboard.press('Escape');
  await expect(listbox(page)).toBeHidden();
  await expect(input(page)).toHaveValue('g');
  await page.keyboard.press('Escape');
  await expect(input(page)).toHaveValue('');
});

test('hides the list and says so when nothing matches', async ({ page }) => {
  await input(page).fill('zz');
  await expect(listbox(page)).toBeHidden();
  await expect(page.getByRole('status')).toHaveText('No results.');
});

test('leaving the input closes the list', async ({ page }) => {
  await input(page).fill('g');
  await page.getByRole('button', { name: 'Next field' }).focus();
  await expect(listbox(page)).toBeHidden();
  await expect(input(page)).toHaveAttribute('aria-expanded', 'false');
});

test('has no WCAG violations with the list open', async ({ page }) => {
  await input(page).fill('g');
  await page.keyboard.press('ArrowDown');
  // Scoped to the component: an open list covering whatever sits below it is expected.
  await expectNoA11yViolations(page, { include: '[data-ui="combobox"]' });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the native datalist suggestions still work', async ({ page }) => {
    await expect(page.getByLabel('Find a store near you')).toHaveAttribute('list', 'city-options');
  });
});
