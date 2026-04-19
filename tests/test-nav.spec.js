const { test, expect } = require('@playwright/test');

const PAGES = [
    { url: '/dashboard.html',              label: 'Dashboard',             activeText: 'Dashboard' },
    { url: '/Semester1Timetable2026.html',  label: 'Semester 1',            activeText: 'Semester 1 Timetable' },
    { url: '/index.html',                   label: 'Semester 2',            activeText: 'Semester 2 Timetable' },
    { url: '/planner.html',                 label: 'Day Planner',           activeText: 'Day Planner' },
    { url: '/timer.html',                   label: 'Focus Timer',           activeText: 'Focus Timer' },
    { url: '/assignments.html',             label: 'Assignments',           activeText: 'Assignments' },
    { url: '/analytics.html',               label: 'Analytics',             activeText: 'Analytics' },
];

const BASE = 'http://localhost:8000';

// Use mobile viewport for all tests
test.use({ viewport: { width: 375, height: 812 } });

for (const page_ of PAGES) {
    test.describe(`Nav on ${page_.label}`, () => {

        test('bottom bar is visible with page name and MENU button', async ({ page }) => {
            await page.goto(BASE + page_.url, { waitUntil: 'domcontentloaded' });
            const bar = page.locator('.bottom-nav');
            await expect(bar).toBeVisible();
            // Page label
            const pageLabel = bar.locator('.bottom-nav__page');
            await expect(pageLabel).toBeVisible();
            await expect(pageLabel).toHaveText(page_.label);
            // Menu button
            const menuBtn = bar.locator('.nav-toggle');
            await expect(menuBtn).toBeVisible();
        });

        test('overlay is hidden by default', async ({ page }) => {
            await page.goto(BASE + page_.url, { waitUntil: 'domcontentloaded' });
            const overlay = page.locator('.nav-overlay');
            await expect(overlay).not.toHaveClass(/open/);
            // Should be invisible (visibility:hidden + opacity:0)
            await expect(overlay).toHaveCSS('visibility', 'hidden');
        });

        test('clicking MENU opens overlay', async ({ page }) => {
            await page.goto(BASE + page_.url, { waitUntil: 'domcontentloaded' });
            const menuBtn = page.locator('.nav-toggle');
            const overlay = page.locator('.nav-overlay');

            await menuBtn.click();
            await expect(overlay).toHaveClass(/open/);
            await expect(overlay).toHaveCSS('visibility', 'visible');
            await expect(overlay).toHaveCSS('opacity', '1');
        });

        test('overlay shows all 7 links', async ({ page }) => {
            await page.goto(BASE + page_.url, { waitUntil: 'domcontentloaded' });
            await page.locator('.nav-toggle').click();
            const links = page.locator('.nav-overlay__links a');
            await expect(links).toHaveCount(7);
        });

        test('correct link is marked active', async ({ page }) => {
            await page.goto(BASE + page_.url, { waitUntil: 'domcontentloaded' });
            await page.locator('.nav-toggle').click();
            const activeLink = page.locator('.nav-overlay__links a.active');
            await expect(activeLink).toHaveCount(1);
            await expect(activeLink).toHaveText(page_.activeText);
        });

        test('CLOSE button shuts overlay', async ({ page }) => {
            await page.goto(BASE + page_.url, { waitUntil: 'domcontentloaded' });
            const overlay = page.locator('.nav-overlay');
            await page.locator('.nav-toggle').click();
            await expect(overlay).toHaveClass(/open/);

            await page.locator('.nav-overlay__close').click();
            await expect(overlay).not.toHaveClass(/open/);
        });

        test('links navigate to correct pages', async ({ page }) => {
            await page.goto(BASE + page_.url, { waitUntil: 'domcontentloaded' });
            await page.locator('.nav-toggle').click();
            // Pick a link that's NOT the current page
            const targetIdx = page_.url === '/dashboard.html' ? 3 : 0; // planner or dashboard
            const targetLink = page.locator('.nav-overlay__links a').nth(targetIdx);
            const href = await targetLink.getAttribute('href');
            await targetLink.click();
            await page.waitForURL('**/' + href);
        });
    });
}
