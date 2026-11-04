const { test: base, expect } = require('@playwright/test');
const path = require('node:path');

// Use the real SDK locally; mock only the remote services. No production writes.
const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.hostname === '127.0.0.1') return route.continue();
      if (url.hostname === 'cdn.jsdelivr.net') {
        return route.fulfill({
          path: path.resolve(__dirname, '../../node_modules/@supabase/supabase-js/dist/umd/supabase.js'),
          contentType: 'text/javascript',
        });
      }
      if (url.hostname.endsWith('.supabase.co')) {
        if (url.pathname === '/rest/v1/products' && route.request().method() === 'GET') {
          return route.fulfill({ json: [] });
        }
        if (url.pathname === '/auth/v1/token') {
          return route.fulfill({ status: 400, json: { code: 'invalid_credentials', msg: 'Invalid login credentials' } });
        }
        if (url.pathname === '/auth/v1/signup') {
          return route.fulfill({ json: { id: 'test-user', email: 'buyer@example.test', identities: [] } });
        }
        return route.abort();
      }
      return route.abort();
    });
    await page.routeWebSocket('**/realtime/v1/**', socket => socket.close());
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await use(page);
    expect(errors, 'Unexpected browser JavaScript errors').toEqual([]);
  },
});
module.exports = { test, expect };
