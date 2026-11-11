import { test, expect } from '@playwright/test';
import { expectNoA11yViolations } from './helpers.js';

const scrollLeft = (viewport) => viewport.evaluate((el) => Math.abs(el.scrollLeft));

test.describe('carousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/carousel.html');
  });

  const viewport = (page) => page.getByRole('region', { name: 'Colors' });
  const previous = (page) => page.getByRole('button', { name: 'Previous' });
  const next = (page) => page.getByRole('button', { name: 'Next' });

  test('adds Previous and Next buttons that control the strip', async ({ page }) => {
    const id = await viewport(page).getAttribute('id');

    expect(id).toBeTruthy();
    await expect(previous(page)).toHaveAttribute('aria-controls', id);
    await expect(next(page)).toHaveAttribute('aria-controls', id);
  });

  test('keeps the items as a list', async ({ page }) => {
    await expect(viewport(page).getByRole('listitem')).toHaveCount(6);
  });

  test('Previous is unavailable at the start', async ({ page }) => {
    await expect(previous(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(next(page)).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('Next moves one item along', async ({ page }) => {
    const step = await viewport(page).evaluate((el) => {
      const items = el.querySelectorAll('li');
      return items[1].offsetLeft - items[0].offsetLeft;
    });
    await next(page).click();

    await expect.poll(() => scrollLeft(viewport(page))).toBeCloseTo(step, 0);
    await expect(previous(page)).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('Previous moves back', async ({ page }) => {
    await next(page).click();
    await expect.poll(() => scrollLeft(viewport(page))).toBeGreaterThan(0);
    await previous(page).click();

    await expect.poll(() => scrollLeft(viewport(page))).toBe(0);
    await expect(previous(page)).toHaveAttribute('aria-disabled', 'true');
  });

  test('Next keeps focus when it reaches the end', async ({ page }) => {
    await next(page).focus();
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
    }

    await expect(next(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(next(page)).toBeFocused();
    const { left, max } = await viewport(page).evaluate((el) => ({
      left: Math.abs(el.scrollLeft),
      max: el.scrollWidth - el.clientWidth,
    }));
    expect(max - left).toBeLessThanOrEqual(1);
  });

  test('has no axe violations', async ({ page }) => {
    await expect(next(page)).toBeVisible();

    await expectNoA11yViolations(page);
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('is a strip that scrolls and takes keyboard focus', async ({ page }) => {
      await expect(page.getByRole('button')).toHaveCount(0);
      const overflow = await viewport(page).evaluate((el) => el.scrollWidth > el.clientWidth);
      expect(overflow).toBe(true);

      await viewport(page).focus();
      await expect(viewport(page)).toBeFocused();
    });
  });
});
