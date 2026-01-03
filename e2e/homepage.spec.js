/**
 * Homepage E2E Tests
 * Tests for landing page, services, and navigation
 */

const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Page Load', () => {
    test('should load the homepage successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/enviro|waste|recycling/i);
    });

    test('should display hero section', async ({ page }) => {
      const heroSection = page.locator('section').first();
      await expect(heroSection).toBeVisible();
    });

    test('should display main heading', async ({ page }) => {
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should display navigation bar', async ({ page }) => {
      const nav = page.locator('nav, header');
      await expect(nav.first()).toBeVisible();
    });

    test('should have home link', async ({ page }) => {
      const homeLink = page.locator('a[href="/"], nav a').first();
      await expect(homeLink).toBeVisible();
    });

    test('should navigate to about page', async ({ page }) => {
      await page.click('a[href*="about"], text=/about/i');
      await expect(page).toHaveURL(/about/);
    });

    test('should navigate to signin page', async ({ page }) => {
      await page.click('a[href*="signin"], text=/sign in|login/i');
      await expect(page).toHaveURL(/signin/);
    });

    test('should navigate to signup page', async ({ page }) => {
      await page.click('a[href*="signup"], text=/sign up|register|get started/i');
      await expect(page).toHaveURL(/signup/);
    });
  });

  test.describe('Services Section', () => {
    test('should display services section', async ({ page }) => {
      const servicesSection = page.locator('#services, section:has-text("Services")');
      await expect(servicesSection.first()).toBeVisible();
    });

    test('should display service cards', async ({ page }) => {
      const serviceCards = page.locator('[class*="card"], [class*="service"]');
      await expect(serviceCards.first()).toBeVisible();
    });

    test('should display waste collection service', async ({ page }) => {
      await expect(page.locator('text=/waste collection/i').first()).toBeVisible();
    });

    test('should display recycling service', async ({ page }) => {
      await expect(page.locator('text=/recycl/i').first()).toBeVisible();
    });
  });

  test.describe('Footer', () => {
    test('should display footer', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('should have contact information', async ({ page }) => {
      await expect(page.locator('text=/contact|email|phone/i').first()).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');

      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
    });
  });
});
