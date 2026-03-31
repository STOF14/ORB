const { test, expect } = require('@playwright/test');

test('Planner loads and shows sign-in', async ({ page }) => {
  await page.goto('http://localhost:8000/planner.html');
  await expect(page).toHaveTitle(/Planner/);
  await expect(page.locator('button', { hasText: 'Sign in with Google' })).toBeVisible();
});