/**
 * Authentication E2E Tests
 * Complete workflows for signup, signin, signout
 */

const { test, expect } = require('@playwright/test');

test.describe('Authentication Workflows', () => {
  test.describe('User Signup Flow', () => {
    test('should display signup page correctly', async ({ page }) => {
      await page.goto('/signup');

      // Check page elements
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    });

    test('should show validation errors for empty form submission', async ({ page }) => {
      await page.goto('/signup');

      // Submit empty form
      await page.click('button[type="submit"]');

      // Should show validation errors
      await expect(page.locator('text=/required|fill|enter/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/signup');

      // Fill invalid email
      await page.fill('input[type="email"], input[name="email"]', 'invalidemail');
      await page.click('button[type="submit"]');

      // Should show email validation error
      await expect(page.locator('text=/email|invalid|format/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('should show error for weak password', async ({ page }) => {
      await page.goto('/signup');

      // Fill weak password
      await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
      await page.fill('input[type="password"], input[name="password"]', '123');
      await page.click('button[type="submit"]');

      // Should show password validation error
      await expect(page.locator('text=/password|weak|minimum|characters/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('should navigate to signin page when link clicked', async ({ page }) => {
      await page.goto('/signup');

      // Click signin link
      await page.click('a[href*="signin"], text=/sign in|login|already have/i');

      // Should navigate to signin
      await expect(page).toHaveURL(/signin/);
    });
  });

  test.describe('User Signin Flow', () => {
    test('should display signin page correctly', async ({ page }) => {
      await page.goto('/signin');

      // Check page elements
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/signin');

      // Fill invalid credentials
      await page.fill('input[type="email"], input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[type="password"], input[name="password"]', 'WrongPassword123!');
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=/invalid|incorrect|not found|error/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('should show validation for empty email', async ({ page }) => {
      await page.goto('/signin');

      await page.fill('input[type="password"], input[name="password"]', 'Password123!');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=/email|required/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('should show validation for empty password', async ({ page }) => {
      await page.goto('/signin');

      await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=/password|required/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('should navigate to signup page when link clicked', async ({ page }) => {
      await page.goto('/signin');

      // Click signup link
      await page.click('a[href*="signup"], text=/sign up|register|create account/i');

      // Should navigate to signup
      await expect(page).toHaveURL(/signup/);
    });
  });
});
