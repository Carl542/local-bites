const { test, expect } = require('./fixtures');

test('portal selection loads the shared shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-role="buyer"]')).toBeVisible();
  await expect(page.locator('[data-role="seller"]')).toBeVisible();
  await expect(page.locator('.entry-loading')).toHaveCount(0);
});

for (const role of ['buyer', 'seller']) {
  test(role + ' authentication form switches modes and hides passwords', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-role="' + role + '"]').click();
    await expect(page.locator('#auth-role-text')).toHaveText(new RegExp(role, 'i'));
    await expect(page.locator('#auth-email')).toBeFocused();
    await page.locator('#auth-password').fill('secret123');
    await page.getByRole('button', { name: 'Show password', exact: true }).click();
    await expect(page.locator('#auth-password')).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Hide password', exact: true }).click();
    await expect(page.locator('#auth-password')).toHaveAttribute('type', 'password');
    await page.locator('#auth-switch').click();
    await expect(page.locator('#auth-submit')).toContainText('Create account');
    await expect(page.locator('#auth-password')).toHaveAttribute('autocomplete', 'new-password');
    await page.locator('#auth-switch').click();
    await expect(page.locator('#auth-submit')).toContainText('Sign in');
    await page.keyboard.press('Escape');
    await expect(page.locator('#auth-email')).not.toBeVisible();
  });
}

test('invalid login shows the server error and enables retry', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-role="buyer"]').click();
  await page.locator('#auth-email').fill('buyer@example.test');
  await page.locator('#auth-password').fill('wrong-password');
  await page.locator('#auth-submit').click();
  await expect(page.locator('#auth-status')).toHaveText('Invalid login credentials');
  await expect(page.locator('#auth-submit')).toBeEnabled();
  await expect(page).toHaveURL(/index\.html$|\/$/);
});

test('signup asks for email confirmation', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-role="buyer"]').click();
  await page.locator('#auth-switch').click();
  await page.locator('#auth-email').fill('buyer@example.test');
  await page.locator('#auth-password').fill('secret123');
  await page.locator('#auth-submit').click();
  await expect(page.locator('#auth-status')).toHaveText('Account created. Confirm your email, then sign in.');
  await expect(page.locator('#auth-submit')).toBeEnabled();
});

test('required fields prevent an empty login request', async ({ page }) => {
  let authRequests = 0;
  page.on('request', req => { if (req.url().includes('/auth/v1/token')) authRequests++; });
  await page.goto('/');
  await page.locator('[data-role="buyer"]').click();
  await page.locator('#auth-submit').click();
  await expect(page.locator('#auth-email')).toBeFocused();
  expect(authRequests).toBe(0);
});

for (const route of ['pages/home.html', 'pages/browse.html', 'pages/orders.html', 'seller/dashboard.html', 'buyer.html', 'browse.html', 'orders.html', 'seller.html']) {
  test('guest is redirected from /' + route, async ({ page }) => {
    await page.goto('/' + route);
    await expect(page).toHaveURL('/index.html');
    await expect(page.locator('[data-role="buyer"]')).toBeVisible();
    await expect(page.locator('#entry-auth-loading')).toHaveCount(0);
  });
}

test('shell failure displays a recovery link', async ({ page }) => {
  await page.route('**/partials/app-shell.html', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/');
  await expect(page.locator('.entry-load-error')).toContainText('Unable to load the LocalBites application shell.');
  await page.unroute('**/partials/app-shell.html');
  await page.getByRole('link', { name: 'Return to portal selection' }).click();
  await expect(page).toHaveURL('/index.html');
  await expect(page.locator('[data-role=buyer]')).toBeVisible();
});
