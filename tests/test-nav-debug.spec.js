const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:8000';

test.use({ viewport: { width: 375, height: 812 } });

test('Nav visual debug — Dashboard', async ({ page }) => {
    await page.goto(BASE + '/dashboard.html', { waitUntil: 'networkidle' });

    // Wait for loader to vanish (first visit = 3.6s)
    await page.waitForFunction(() => {
        const loader = document.getElementById('orbitdesk-loader');
        return !loader || loader.style.display === 'none';
    }, { timeout: 10000 });

    // Screenshot: page loaded, bottom nav should be visible
    await page.screenshot({ path: 'test-screenshots/01-page-loaded.png', fullPage: false });

    // Check bottom nav position
    const bar = page.locator('.bottom-nav');
    const barBox = await bar.boundingBox();
    console.log('Bottom nav bounding box:', barBox);

    // Check menu button
    const menuBtn = page.locator('.nav-toggle');
    const menuBox = await menuBtn.boundingBox();
    console.log('Menu button bounding box:', menuBox);

    // Is anything covering the menu button? Check at button center
    if (menuBox) {
        const cx = menuBox.x + menuBox.width / 2;
        const cy = menuBox.y + menuBox.height / 2;
        const topEl = await page.evaluate(({x, y}) => {
            const el = document.elementFromPoint(x, y);
            return el ? { tag: el.tagName, id: el.id, className: el.className, text: el.textContent?.slice(0, 50) } : null;
        }, { x: cx, y: cy });
        console.log('Element at menu button center:', topEl);
    }

    // Click the menu
    await menuBtn.click();
    await page.waitForTimeout(200);

    // Screenshot: overlay open
    await page.screenshot({ path: 'test-screenshots/02-overlay-open.png', fullPage: false });

    const overlay = page.locator('.nav-overlay');
    const isOpen = await overlay.evaluate(el => el.classList.contains('open'));
    console.log('Overlay has .open class:', isOpen);

    // Check overlay computed styles
    const overlayStyles = await overlay.evaluate(el => {
        const s = getComputedStyle(el);
        return { display: s.display, opacity: s.opacity, visibility: s.visibility, zIndex: s.zIndex };
    });
    console.log('Overlay computed styles:', overlayStyles);

    // Check all links are visible
    const links = page.locator('.nav-overlay__links a');
    const count = await links.count();
    console.log('Number of nav links:', count);
    for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const visible = await link.isVisible();
        const box = await link.boundingBox();
        console.log(`  Link ${i}: "${text}" visible=${visible} box=`, box);
    }

    // Close
    await page.locator('.nav-overlay__close').click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'test-screenshots/03-overlay-closed.png', fullPage: false });
});

test('Nav visual debug — Semester1Timetable (user current page)', async ({ page }) => {
    await page.goto(BASE + '/Semester1Timetable2026.html', { waitUntil: 'networkidle' });

    await page.waitForFunction(() => {
        const loader = document.getElementById('orbitdesk-loader');
        return !loader || loader.style.display === 'none';
    }, { timeout: 10000 });

    await page.screenshot({ path: 'test-screenshots/04-sem1-loaded.png', fullPage: false });

    const menuBtn = page.locator('.nav-toggle');
    const menuBox = await menuBtn.boundingBox();
    console.log('[Sem1] Menu button bounding box:', menuBox);

    // Check what's at the very bottom of viewport
    const bottomCheck = await page.evaluate(() => {
        const els = [];
        for (let x = 50; x < 350; x += 50) {
            const el = document.elementFromPoint(x, window.innerHeight - 26);
            if (el) els.push({ x, tag: el.tagName, id: el.id, className: el.className.toString().slice(0, 40) });
        }
        return els;
    });
    console.log('[Sem1] Elements at bottom of viewport:', bottomCheck);

    await menuBtn.click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'test-screenshots/05-sem1-overlay.png', fullPage: false });

    const linkTexts = await page.locator('.nav-overlay__links a').allTextContents();
    console.log('[Sem1] All link texts:', linkTexts);

    const activeLink = await page.locator('.nav-overlay__links a.active').textContent();
    console.log('[Sem1] Active link:', activeLink);
});
