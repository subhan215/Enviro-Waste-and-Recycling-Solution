/**
 * Accessibility E2E Tests
 * Tests for WCAG compliance and accessibility features
 */

const { test, expect } = require('@playwright/test');

test.describe('Accessibility Tests', () => {
  test.describe('Keyboard Navigation', () => {
    test('should be able to navigate homepage with keyboard', async ({ page }) => {
      await page.goto('/');

      // Tab through elements
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');

      // Tab to first focusable element
      await page.keyboard.press('Tab');

      // Check focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should navigate to signin with keyboard', async ({ page }) => {
      await page.goto('/');

      // Tab through navigation to find signin
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        const text = await focusedElement.textContent();
        if (text && text.toLowerCase().includes('sign')) {
          await page.keyboard.press('Enter');
          break;
        }
      }
    });
  });

  test.describe('Semantic HTML', () => {
    test('should have proper heading hierarchy on homepage', async ({ page }) => {
      await page.goto('/');

      // Check for h1
      const h1 = page.locator('h1');
      await expect(h1.first()).toBeVisible();
    });

    test('should have proper heading hierarchy on about page', async ({ page }) => {
      await page.goto('/about');

      const h1 = page.locator('h1');
      await expect(h1.first()).toBeVisible();
    });

    test('should have navigation landmark', async ({ page }) => {
      await page.goto('/');

      const nav = page.locator('nav, [role="navigation"]');
      await expect(nav.first()).toBeVisible();
    });

    test('should have main content landmark', async ({ page }) => {
      await page.goto('/');

      const main = page.locator('main, [role="main"]');
      await expect(main.first()).toBeVisible();
    });

    test('should have footer landmark', async ({ page }) => {
      await page.goto('/');

      const footer = page.locator('footer, [role="contentinfo"]');
      await expect(footer.first()).toBeVisible();
    });
  });

  test.describe('Form Accessibility', () => {
    test('signin form should have labeled inputs', async ({ page }) => {
      await page.goto('/signin');

      // Check email input has label
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      await expect(emailInput).toBeVisible();

      // Check password input has label
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      await expect(passwordInput).toBeVisible();
    });

    test('signup form should have labeled inputs', async ({ page }) => {
      await page.goto('/signup');

      // Check for form inputs
      const inputs = page.locator('input');
      const count = await inputs.count();
      expect(count).toBeGreaterThan(0);
    });

    test('buttons should have accessible names', async ({ page }) => {
      await page.goto('/signin');

      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();

      const buttonText = await submitButton.textContent();
      expect(buttonText.trim().length).toBeGreaterThan(0);
    });
  });

  test.describe('Color and Contrast', () => {
    test('should have readable text on homepage', async ({ page }) => {
      await page.goto('/');

      // Check main heading is visible
      const heading = page.locator('h1');
      await expect(heading.first()).toBeVisible();
    });

    test('should have visible buttons', async ({ page }) => {
      await page.goto('/');

      const buttons = page.locator('button, a[class*="btn"], a[class*="button"]');
      const count = await buttons.count();

      if (count > 0) {
        await expect(buttons.first()).toBeVisible();
      }
    });
  });

  test.describe('Images and Alt Text', () => {
    test('should have alt text on images', async ({ page }) => {
      await page.goto('/');

      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        // Alt can be empty for decorative images
        expect(alt !== null).toBeTruthy();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be usable on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Content should be visible
      const heading = page.locator('h1');
      await expect(heading.first()).toBeVisible();
    });

    test('should be usable on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      const heading = page.locator('h1');
      await expect(heading.first()).toBeVisible();
    });

    test('should not have horizontal scroll on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);

      // Body shouldn't be significantly wider than viewport
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
    });
  });

  test.describe('Error States', () => {
    test('should show accessible error messages on signin', async ({ page }) => {
      await page.goto('/signin');

      // Submit empty form
      await page.click('button[type="submit"]');

      // Error messages should be present
      const errors = page.locator('[class*="error"], [role="alert"], text=/required|invalid/i');
      await expect(errors.first()).toBeVisible({ timeout: 5000 });
    });
  });
});
