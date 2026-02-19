/**
 * Captures screenshots for SARD_USER_MANUAL.html.
 * Run with: node scripts/capture-manual-screenshots.cjs
 * Requires: npm install puppeteer (from content-management-frontend or repo root)
 * Backend (port 5290) and frontend (port 3000) must be running.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'asimalali@hotmail.com';
const TEST_OTP = '000000'; // 6 digits (frontend requires 6); matches backend DefaultOtp
const ADMIN_EMAIL = 'admin@test.com';
const OUT_DIR = path.join(__dirname, '..', '..', 'screenshots');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function loginAsUser(page, email, otp) {
  await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle2', timeout: 15000 });
  await sleep(800);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  // Ensure login tab is active
  const loginTab = await page.evaluateHandle(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
    return tabs.find((t) => t.textContent && t.textContent.includes('تسجيل الدخول'));
  });
  if (loginTab) {
    const el = loginTab.asElement();
    if (el) await el.click();
  }
  await sleep(400);
  await page.type('input[type="email"]', email, { delay: 60 });
  await sleep(300);
  const loginBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button[type="submit"]'));
    return buttons.find((b) => b.textContent && (b.textContent.includes('تسجيل الدخول') || b.textContent.includes('إنشاء')));
  });
  if (loginBtn) {
    const el = loginBtn.asElement();
    if (el) await el.click();
  } else {
    await page.click('form button[type="submit"]');
  }
  // Wait for OTP screen (verification step)
  await sleep(3000);
  // input-otp uses a single hidden input or slots; focus OTP container and type with keyboard
  const otpContainer = await page.$('[class*="OTP"], [class*="otp"], .flex.items-center.gap-2');
  if (otpContainer) {
    await otpContainer.click();
    await sleep(200);
    await page.keyboard.type(otp, { delay: 80 });
  } else {
    const otpInputs = await page.$$('input[inputmode="numeric"], input[maxlength="1"]');
    if (otpInputs.length >= Math.min(6, otp.length)) {
      for (let i = 0; i < Math.min(otp.length, otpInputs.length); i++) {
        await otpInputs[i].click();
        await otpInputs[i].type(otp[i], { delay: 50 });
      }
    } else {
      const singleOtp = await page.$('input');
      if (singleOtp) {
        await singleOtp.click();
        await singleOtp.type(otp, { delay: 60 });
      }
    }
  }
  await sleep(500);
  const verifyBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.textContent && b.textContent.trim().includes('تأكيد'));
  });
  if (verifyBtn) {
    const el = verifyBtn.asElement();
    if (el) await el.click();
  } else {
    await page.click('form button[type="submit"]');
  }
  // Wait until we leave auth (dashboard or other app page)
  await page.waitForFunction(
    () => !window.location.pathname.startsWith('/auth') && window.location.pathname !== '/',
    { timeout: 15000 }
  ).catch(() => {});
  await sleep(2000);
}

async function capture(page, name, isAuthPage = false) {
  if (!isAuthPage) {
    const onAuth = await page.evaluate(() => !!document.querySelector('form input[type="email"]'));
    if (onAuth) {
      console.warn('Warning: page still shows login form for', name, '- waiting 3s then retrying');
      await sleep(3000);
    }
  }
  ensureDir(OUT_DIR);
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log('Saved:', file);
}

async function main() {
  ensureDir(OUT_DIR);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en,ar' });

  try {
    // 1. Auth page - Registration form (register tab)
    await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(500);
    const registerTab = await page.evaluateHandle(() => {
      const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
      return tabs.find((t) => t.textContent.includes('إنشاء حساب'));
    });
    if (registerTab) {
      const el = registerTab.asElement();
      if (el) await el.click();
    }
    await sleep(500);
    await capture(page, '01-registration-form', true);

    // 2. Login screen (login tab)
    const loginTab = await page.evaluateHandle(() => {
      const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
      return tabs.find((t) => t.textContent.includes('تسجيل الدخول'));
    });
    if (loginTab) {
      const el = loginTab.asElement();
      if (el) await el.click();
    }
    await sleep(400);
    await capture(page, '02-login-screen', true);

    // 3. Login as test user
    await loginAsUser(page, TEST_EMAIL, TEST_OTP);

    // 4. Dashboard
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(2000);
    await capture(page, '03-dashboard-overview');

    // 5. New project form
    await page.goto(`${BASE_URL}/projects/new`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);
    await capture(page, '04-new-project-form');

    // 6. Project edit with Personas (need a project first - go to projects and open first edit, or stay on new and show empty state)
    await page.goto(`${BASE_URL}/projects`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);
    const firstProjectLink = await page.$('a[href*="/projects/"][href*="/edit"]');
    if (firstProjectLink) {
      await firstProjectLink.click();
      await sleep(2000);
      const personasTab = await page.evaluateHandle(() => {
        const tabs = Array.from(document.querySelectorAll('button[role="tab"], [role="tab"]'));
        return tabs.find((t) => t.textContent.includes('Personas') || t.textContent.includes('الشخصيات'));
      });
      if (personasTab) {
        const el = personasTab.asElement();
        if (el) await el.click();
        await sleep(1000);
      }
    }
    await capture(page, '05-audience-personas-panel');

    // 7. Templates
    await page.goto(`${BASE_URL}/templates`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);
    await capture(page, '06-templates-library');

    // 8. Content ideas (dashboard widget) - already have dashboard; take another with ideas visible
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(2000);
    await capture(page, '07-content-ideas-widget');

    // 9. Content library
    await page.goto(`${BASE_URL}/library`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);
    await capture(page, '08-content-library');

    // 10. Calendar (week view or generation dialog - try calendar page)
    await page.goto(`${BASE_URL}/calendar`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(2000);
    await capture(page, '09-calendar-week-view');

    // 11. Optimization dialog - open from library: click a content item then "Optimize" if available
    await page.goto(`${BASE_URL}/library`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);
    const firstContent = await page.$('button, [role="button"], a');
    if (firstContent) {
      await firstContent.click();
      await sleep(1500);
      const optimizeBtn = await page.evaluateHandle(() => {
        const nodes = Array.from(document.querySelectorAll('button, [role="button"], a'));
        return nodes.find((n) => n.textContent && (n.textContent.includes('Optimize') || n.textContent.includes('تحسين')));
      });
      if (optimizeBtn) {
        const el = optimizeBtn.asElement();
        if (el) await el.click();
        await sleep(1500);
      }
    }
    await capture(page, '10-optimization-dialog');

    // 12. Settings (integrations / connected accounts)
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);
    await capture(page, '11-connected-accounts-settings');

    // 13. Publish page
    await page.goto(`${BASE_URL}/publish`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);
    await capture(page, '12-publish-page');

    // 14. Posts (metrics)
    await page.goto(`${BASE_URL}/posts`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);
    await capture(page, '13-posts-metrics');

    // 15. Plans
    await page.goto(`${BASE_URL}/plans`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);
    await capture(page, '14-plans-page');

    // 16. Integrations (same as settings - use same screenshot or take again)
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1000);
    await capture(page, '15-integrations-settings');

    // 17–19. Admin: log out first, then login as admin
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
    await sleep(500);
    await loginAsUser(page, ADMIN_EMAIL, TEST_OTP);

    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(2000);
    await capture(page, '16-admin-dashboard');

    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);
    await capture(page, '17-admin-users');

    await page.goto(`${BASE_URL}/admin/feature-flags`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);
    await capture(page, '18-admin-feature-flags');

    console.log('All screenshots saved to', OUT_DIR);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
