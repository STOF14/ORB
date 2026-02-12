const { test, expect } = require('@playwright/test');

test('Planner loads and shows sign-in', async ({ page }) => {
  await page.goto('http://localhost:8000/planner.html');
  await expect(page).toHaveTitle(/Planner/);
  await expect(page.locator('button', { hasText: 'Sign in with Google' })).toBeVisible();
});

test('Add a task and check persistence', async ({ page }) => {
  await page.goto('http://localhost:8000/planner.html');
  if (await page.locator('button', { hasText: 'Sign in with Google' }).isVisible()) {
    test.skip('Google sign-in required for sync test');
    return;
  }
  const firstInput = page.locator('.activity-input').first();
  await firstInput.fill('Automated Test Task');
  await firstInput.blur();
  await page.waitForTimeout(1000);
  await page.reload();
  await expect(firstInput).toHaveValue('Automated Test Task');
});

test('Dashboard loads and shows review', async ({ page }) => {
  await page.goto('http://localhost:8000/dashboard.html');
  await expect(page).toHaveTitle(/Academic Overview/);
  await expect(page.locator('#reviewGrid')).toBeVisible();
});

test('Timetable edit persists (Semester 1, non-empty event)', async ({ page }) => {
  await page.goto('http://localhost:8000/Semester1Timetable2026.html');
  const editBtn = page.locator('#editToggle');
  await editBtn.click();
  await expect(page.locator('.edit-time').nth(1)).toBeVisible();
  const timeInput = page.locator('.edit-time').nth(1); // event-id="1", a non-empty event
  const activityInput = page.locator('.edit-activity').nth(1);
  const originalTime = await timeInput.inputValue();
  const parts = originalTime.split('-');
  const newTime = parts.length === 2 ? `09:00-${parts[1]}` : '09:00';
  const newActivity = 'Automated Persisted Event';
  await timeInput.fill(newTime);
  await timeInput.blur();
  await activityInput.fill(newActivity);
  await activityInput.blur();
  await page.waitForTimeout(1000);
  await editBtn.click();
  await page.reload();
  await editBtn.click();
  try {
    await expect(timeInput).toHaveValue(newTime);
    await expect(activityInput).toHaveValue(newActivity);
  } catch (e) {
    await page.screenshot({ path: 'fail-sem1.png', fullPage: false });
    // Try to log the outer HTML of the parent row, fallback to error message if not found
    try {
      const failedRow = await page.locator('.edit-row').nth(1);
      if (await failedRow.count() > 0) {
        const html = await failedRow.evaluate(node => node.outerHTML);
        console.log('Failed row outerHTML:', html);
      } else {
        console.log('Failed row not found.');
      }
    } catch (rowErr) {
      console.log('Error extracting failed row HTML:', rowErr);
    }
    throw e;
  }
});