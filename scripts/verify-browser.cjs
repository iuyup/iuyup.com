/* eslint-disable @typescript-eslint/no-require-imports -- Configurable CommonJS browser runtime. */
// Run against a local production server. All interactive APIs are mocked:
// this check neither spends model credits nor changes the guestbook/view count.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const [path, locale] of [['/', 'zh-CN'], ['/en', 'en']]) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let calls = 0;
      await page.route('**/api/**', async route => {
        const pathname = new URL(route.request().url()).pathname;
        if (pathname === '/api/chat') {
          const payload = route.request().postDataJSON();
          assert.equal(payload.locale, locale);
          assert.ok(payload.messages.every(m => m.content.trim()));
          assert.equal(payload.messages.filter(m => m.role === 'user').length, 1, 'retry must not duplicate the question');
          calls++;
          await route.fulfill({ status: 200, contentType: 'text/plain', body: calls === 1 ? '' : 'Recovered reply' });
        } else if (pathname === '/api/site-views') {
          await route.fulfill({ json: { total: 100 } });
        } else if (pathname === '/api/guestbook') {
          await route.fulfill({ json: { messages: [] } });
        } else {
          await route.fulfill({ status: 503, json: { error: 'Mocked optional service' } });
        }
      });
      await page.goto((process.env.SELFWEB_BASE_URL || 'http://127.0.0.1:3018') + path, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('lang'), locale);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(overflow, false, 'mobile page must not overflow horizontally');
      const writing = page.locator(`section a[href="${locale === 'en' ? '/en/posts' : '/posts'}"]`).first();
      const chatButton = page.getByRole('button', { name: /Chat with T/ });
      const writingBox = await writing.boundingBox();
      const chatBox = await chatButton.boundingBox();
      assert.ok(writingBox.y < chatBox.y, 'writing entry must appear before chat on mobile');
      assert.equal(await page.locator('#home-chat-input').evaluate(el => el.closest('[inert]') !== null), true);
      await chatButton.focus();
      await page.keyboard.press('Enter');
      await page.locator('#home-chat-input').fill('Hello');
      await page.getByRole('button', { name: locale === 'en' ? 'Send' : '发送', exact: true }).click();
      const retry = page.getByRole('button', { name: locale === 'en' ? 'Retry' : '重试', exact: true });
      await retry.waitFor();
      await retry.click();
      await page.getByText('Recovered reply', { exact: true }).waitFor();
      assert.equal(calls, 2);
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => document.activeElement instanceof HTMLButtonElement && document.activeElement.textContent.includes('Chat with T'));
      assert.equal(await chatButton.evaluate(el => document.activeElement === el), true);
      await page.setViewportSize({ width: 1440, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
      assert.deepEqual(errors, []);
      console.log(`${locale}: mobile layout, server language, keyboard access, empty-reply retry, and desktop overflow passed`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
