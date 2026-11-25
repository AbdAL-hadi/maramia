import { expect, test } from '@playwright/test'

test('a lazy FAQ deep link restores focus after loading and supports back, forward, and refresh', async ({ page }) => {
  await page.route('**/*FaqPage*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    await route.continue()
  })
  await page.goto('/')
  await page.goto('/faq#faq-search')
  const section = page.locator('#faq-search')
  await expect(section).toBeFocused()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await page.getByRole('banner').getByRole('button', { name: 'Switch to English' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page).toHaveTitle('Frequently Asked Questions | Maramia UAE')
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Frequently Asked Questions | Maramia UAE')
  await page.goBack()
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText('MARAMIA UAE')
  await page.goForward()
  await expect(section).toBeFocused()
  await page.reload()
  await expect(section).toBeFocused()
})

test('public head tags and sharing assets survive direct access and bilingual 404 recovery', async ({ page, request }) => {
  const response = await request.get('/offers/welcome-to-maramia')
  expect(response.ok()).toBeTruthy()
  const html = await response.text()
  expect(html).toContain('<meta name="robots" content="noindex, nofollow"')
  expect(html).toContain('/maramia-share.jpg')
  for (const [url, contentType] of [['/robots.txt', 'text/plain'], ['/maramia.svg', 'image/svg+xml'], ['/maramia-share.jpg', 'image/jpeg']]) {
    const asset = await request.get(url)
    expect(asset.ok()).toBeTruthy()
    expect(asset.headers()['content-type']).toContain(contentType)
  }
  await page.goto('/reservation/invalid/unrecognized')
  const heading = page.getByRole('main').getByRole('heading', { level: 1 })
  await expect(heading).toHaveText('الصفحة غير موجودة')
  await page.getByRole('banner').getByRole('button', { name: 'Switch to English' }).click()
  await expect(heading).toHaveText('Page not found')
  await expect(page).toHaveTitle('Page not found | Maramia UAE')
  await page.getByRole('main').getByRole('link', { name: 'Explore Our Menu' }).click()
  await expect(page).toHaveURL(/\/menu$/)
})
