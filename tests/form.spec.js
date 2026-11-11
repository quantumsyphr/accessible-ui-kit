import { test, expect } from '@playwright/test';
import { expectNoA11yViolations } from './helpers.js';

const FIXTURE = '/tests/fixtures/form.html';

test.describe('form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE);
  });

  const submit = (page) => page.getByRole('button', { name: 'Notify me' });
  const summary = (page) => page.getByRole('group', { name: 'There is a problem' });

  test('shows nothing until the form is submitted', async ({ page }) => {
    const email = page.getByLabel('Email');
    await email.fill('not an email');
    await email.blur();

    await expect(summary(page)).toHaveCount(0);
    await expect(email).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('lists every problem in a summary that takes focus', async ({ page }) => {
    await submit(page).click();

    await expect(summary(page)).toBeFocused();
    await expect(summary(page).getByRole('link')).toHaveCount(5);
    await expect(summary(page).getByRole('link').first()).toHaveText('Enter an email address, like name@example.com');
    await expect(page).toHaveURL(FIXTURE);
  });

  test('a summary link moves focus to its field', async ({ page }) => {
    await submit(page).click();
    await summary(page).getByRole('link', { name: 'Choose a size' }).click();

    await expect(page.getByLabel('Size')).toBeFocused();
  });

  test('marks each field invalid and describes it with its message', async ({ page }) => {
    await submit(page).click();

    const size = page.getByLabel('Size');
    await expect(size).toHaveAttribute('aria-invalid', 'true');
    await expect(size).toHaveAccessibleDescription('Error: Choose a size');
  });

  test('keeps a description the field already had', async ({ page }) => {
    await submit(page).click();

    await expect(page.getByLabel('Email')).toHaveAccessibleDescription(
      'We only use it for this order. Error: Enter an email address, like name@example.com',
    );
  });

  test('falls back to the browser message when no message is given', async ({ page }) => {
    await submit(page).click();

    const field = page.getByLabel('Name on the tag');
    const browserMessage = await field.evaluate((el) => el.validationMessage);
    expect(browserMessage).not.toBe('');
    await expect(field).toHaveAccessibleDescription(`Error: ${browserMessage}`);
  });

  test('gives a radio group one message', async ({ page }) => {
    await submit(page).click();

    await expect(page.locator('fieldset [data-field-error]')).toHaveCount(1);
    await expect(page.getByLabel('Pick up in store')).toHaveAccessibleDescription('Error: Choose a delivery option');

    await page.getByLabel('Pick up in store').check();
    await expect(page.locator('fieldset [data-field-error]')).toHaveCount(0);
    await expect(summary(page).getByRole('link')).toHaveCount(4);
  });

  test('clears a message as soon as its field is fixed, without moving focus', async ({ page }) => {
    await submit(page).click();
    const email = page.getByLabel('Email');
    await email.fill('ada@example.com');

    await expect(email).not.toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAccessibleDescription('We only use it for this order.');
    await expect(summary(page).getByRole('link')).toHaveCount(4);
    await expect(email).toBeFocused();
  });

  test('removes the summary once the last problem is fixed', async ({ page }) => {
    await submit(page).click();
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Size').selectOption('m');
    await page.getByLabel('Name on the tag').fill('Ada');
    await page.getByLabel('Ship it').check();
    await page.getByLabel('I agree to the terms').check();

    await expect(summary(page)).toHaveCount(0);
  });

  test('submits normally once everything is valid', async ({ page }) => {
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Size').selectOption('m');
    await page.getByLabel('Name on the tag').fill('Ada');
    await page.getByLabel('Ship it').check();
    await page.getByLabel('I agree to the terms').check();
    await submit(page).click();

    await expect(page).toHaveURL(/size=m/);
  });

  test('has no axe violations with errors showing', async ({ page }) => {
    await submit(page).click();
    await expect(summary(page)).toBeVisible();

    await expectNoA11yViolations(page);
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('leaves validation to the browser', async ({ page }) => {
      await expect(page.locator('form')).not.toHaveAttribute('novalidate');
      await submit(page).click();

      await expect(page).toHaveURL(FIXTURE);
      await expect(page.locator('[data-form-summary]')).toHaveCount(0);
    });
  });
});
