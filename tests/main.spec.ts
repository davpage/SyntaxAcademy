import { expect, test as it } from '@playwright/test';

it('handles i18n routing', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/en');

  // A cookie remembers the last locale
  await page.goto('/hy');
  await page.goto('/');
  await expect(page).toHaveURL('/hy');
  await page
      .getByRole('combobox', { name: 'Փոխել լեզուն' })
      .selectOption({ value: 'en' });

  await expect(page).toHaveURL('/en');
  await page.getByRole('heading', { name: 'David Meloyan' });
});

it('handles not found pages', async ({ page }) => {
  await page.goto('/unknown');
  await page.getByRole('heading', { name: 'Page not found' });

  await page.goto('/hy/unknown');
  await page.getByRole('heading', { name: 'Էջը չի գտնվել' });

  await page.goto('/ru/unknown');
  await page.getByRole('heading', { name: 'Страница не найдена' });
});

it("handles not found pages for routes that don't match the proxy", async ({ page }) => {
  await page.goto('/test.png');
  await page.getByRole('heading', { name: 'This page could not be found.' });

  await page.goto('/api/hello');
  await page.getByRole('heading', { name: 'This page could not be found.' });
});

it('sets caching headers', async ({ request }) => {
  for (const pathname of ['/en', '/en/about', '/hy', '/hy/about', '/ru', '/ru/about']) {
    expect((await request.get(pathname)).headers()['cache-control']).toContain(
        's-maxage=31536000'
    );
  }
});

it('can be used to configure metadata', async ({ page }) => {
  await page.goto('/en');
  await expect(page).toHaveTitle('David Meloyan');

  await page.goto('/hy');
  await expect(page).toHaveTitle('Դավիդ Մելոյան');

  await page.goto('/ru');
  await expect(page).toHaveTitle('Давид Мелоян');
});

it('can be used to localize the page', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('heading', { name: 'David Meloyan' });

  await page.goto('/hy');
  await page.getByRole('heading', { name: 'Դավիդ Մելոյան' });

  await page.goto('/ru');
  await page.getByRole('heading', { name: 'Давид Мелоян' });
});

it('sets a cookie when necessary', async ({ page }) => {
  function getCookieValue() {
    return page.evaluate(() => document.cookie);
  }

  const response = await page.goto('/en');
  expect(await response?.headerValue('set-cookie')).toBe(null);

  await page
      .getByRole('combobox', { name: 'Change language' })
      .selectOption({ value: 'hy' });
  await expect(page).toHaveURL('/hy');
  expect(await getCookieValue()).toBe('NEXT_LOCALE=hy');

  await page
      .getByRole('combobox', { name: 'Փոխել լեզուն' })
      .selectOption({ value: 'ru' });
  await expect(page).toHaveURL('/ru');
  expect(await getCookieValue()).toBe('NEXT_LOCALE=ru');

  await page
      .getByRole('combobox', { name: 'Сменить язык' })
      .selectOption({ value: 'en' });
  await expect(page).toHaveURL('/en');
  expect(await getCookieValue()).toBe('NEXT_LOCALE=en');
});

it("sets a cookie when requesting a locale that doesn't match the `accept-language` header", async ({ page }) => {
  const response = await page.goto('/hy');
  const value = await response?.headerValue('set-cookie');
  expect(value).toContain('NEXT_LOCALE=hy;');
  expect(value).toContain('Path=/;');
  expect(value).toContain('SameSite=lax');
});

it('serves a robots.txt', async ({ page }) => {
  const response = await page.goto('/robots.txt');
  const body = await response?.body();
  expect(body?.toString()).toEqual('User-Agent: *\nAllow: *\n');
});

it('serves a sitemap.xml', async ({ page }) => {
  const response = await page.goto('/sitemap.xml');
  const body = await response!.body();
  expect(body.toString()).toBe(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<url>
<loc>http://localhost:3000/en</loc>
<xhtml:link rel="alternate" hreflang="en" href="http://localhost:3000/en" />
<xhtml:link rel="alternate" hreflang="hy" href="http://localhost:3000/hy" />
<xhtml:link rel="alternate" hreflang="ru" href="http://localhost:3000/ru" />
</url>
<url>
<loc>http://localhost:3000/hy</loc>
<xhtml:link rel="alternate" hreflang="en" href="http://localhost:3000/en" />
<xhtml:link rel="alternate" hreflang="hy" href="http://localhost:3000/hy" />
<xhtml:link rel="alternate" hreflang="ru" href="http://localhost:3000/ru" />
</url>
<url>
<loc>http://localhost:3000/ru</loc>
<xhtml:link rel="alternate" hreflang="en" href="http://localhost:3000/en" />
<xhtml:link rel="alternate" hreflang="hy" href="http://localhost:3000/hy" />
<xhtml:link rel="alternate" hreflang="ru" href="http://localhost:3000/ru" />
</url>
<url>
<loc>http://localhost:3000/en/pathnames</loc>
<xhtml:link rel="alternate" hreflang="en" href="http://localhost:3000/en/pathnames" />
<xhtml:link rel="alternate" hreflang="hy" href="http://localhost:3000/hy/pathnames" />
<xhtml:link rel="alternate" hreflang="ru" href="http://localhost:3000/ru/pathnames" />
</url>
<url>
<loc>http://localhost:3000/hy/pathnames</loc>
<xhtml:link rel="alternate" hreflang="en" href="http://localhost:3000/en/pathnames" />
<xhtml:link rel="alternate" hreflang="hy" href="http://localhost:3000/hy/pathnames" />
<xhtml:link rel="alternate" hreflang="ru" href="http://localhost:3000/ru/pathnames" />
</url>
<url>
<loc>http://localhost:3000/ru/pathnames</loc>
<xhtml:link rel="alternate" hreflang="en" href="http://localhost:3000/en/pathnames" />
<xhtml:link rel="alternate" hreflang="hy" href="http://localhost:3000/hy/pathnames" />
<xhtml:link rel="alternate" hreflang="ru" href="http://localhost:3000/ru/pathnames" />
</url>
</urlset>
`
  );
});

it('provides a manifest', async ({ page }) => {
  const response = await page.goto('/manifest.webmanifest');
  const body = await response!.json();
  await expect(body).toEqual({
    name: expect.stringMatching(/David Meloyan|Դավիդ Մելոյան|Давид Мелоян/),
    start_url: '/',
    theme_color: '#101E33'
  });
});