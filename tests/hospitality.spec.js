import { expect, test } from '@playwright/test'

const main = (page) => page.getByRole('main')
const tour = (page) => page.locator('#virtual-tour')
const scene = (page) => tour(page).locator('.tour-stage')
const gallery = (page) => page.locator('#gallery')
const wizard = (page) => page.locator('#reservation-wizard')

async function openEnglish(page, route) {
  await page.goto(route)
  if (await page.locator('html').getAttribute('lang') === 'ar') {
    await page.locator('header').getByRole('button', { name: 'Switch to English' }).click()
  }
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
}

async function advanceToSeating(page) {
  await page.locator('[data-visit-date="2026-11-26"]').click()
  await page.locator('[data-visit-time="720"]').click()
  await wizard(page).locator('button[type=submit]').click()
  await expect(page.locator('.restaurant-plan')).toBeVisible()
}

async function chooseTable(page, id) {
  await page.locator(`[data-list-table="${id}"]`).click()
  await wizard(page).locator('button[type=submit]').click()
}

test('story route connects verified roots, proposed philosophy, and existing menu item details', async ({ page }) => {
  await openEnglish(page, '/')
  await page.locator('header').getByRole('link', { name: 'Our Story', exact: true }).click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(main(page).getByRole('heading', { level: 1 })).toHaveText('From Palestinian Roots to Your Table.')
  await expect(main(page).getByRole('link', { name: 'See the La Casa Mall listing' })).toHaveAttribute('href', /lacasamall\.ps/)
  await expect(page.locator('.story-values li')).toHaveCount(5)
  await expect(main(page)).toContainText('Proposed values for the UAE dining concept.')
  await expect(main(page).getByRole('heading', { name: 'What Sage Means at Our Table' })).toBeVisible()
  await expect(page.locator('.food-stories li')).toHaveCount(5)
  await page.locator('.food-stories').getByRole('link', { name: 'Chicken Musakhan' }).click()
  await expect(page).toHaveURL(/\/menu\?dish=chicken-musakhan$/)
  await expect(page.getByRole('dialog', { name: 'Chicken Musakhan' })).toBeVisible()
})

test('restaurant route preserves navigation and connects to the menu, ordering, and reservations', async ({ page }) => {
  await openEnglish(page, '/')
  await page.locator('header').getByRole('link', { name: 'Our Restaurant', exact: true }).click()
  await expect(page).toHaveURL(/\/uae$/)
  await expect(main(page).getByRole('heading', { level: 1 })).toHaveText('Welcome to Maramia')
  await expect(main(page).getByRole('heading', { name: 'Settle in and stay awhile' })).toBeVisible()
  await expect(page.locator('[data-experience]')).toHaveCount(4)
  await expect(page.locator('.occasion-links a')).toHaveCount(5)
  await expect(gallery(page).getByRole('button')).toHaveCount(7)
  await expect(page.locator('.restaurant-page .editorial-cta').getByRole('link', { name: 'Reserve a Table' })).toHaveAttribute('href', '/reservation')
  await page.locator('.restaurant-page .editorial-cta').getByRole('link', { name: 'Order Online' }).click()
  await expect(page).toHaveURL(/\/order$/)
  await expect(main(page).getByRole('heading', { level: 1 })).toHaveText('Review Your Order')
})

test('tour supports all six scenes, navigation controls, direct thumbnails, and the tour anchor', async ({ page }) => {
  await openEnglish(page, '/uae')
  await main(page).getByRole('link', { name: 'Start the Tour' }).click()
  await expect(page).toHaveURL(/\/uae#virtual-tour$/)
  await expect(tour(page)).toBeFocused()
  const thumbs = tour(page).getByRole('group', { name: 'Tour Scenes' })
  await expect(thumbs.getByRole('button')).toHaveCount(6)
  const scenes = [
    ['Entrance and Reception', 'entrance'], ['Main Dining Area', 'main'], ['Family Seating', 'family'],
    ['Outdoor Terrace', 'terrace'], ['Private Dining', 'private'], ['Palestinian Table Experience', 'table'],
  ]
  for (const [title, id] of scenes) {
    await thumbs.getByRole('button', { name: title, exact: true }).click()
    await expect(scene(page)).toHaveAttribute('data-tour-scene', id)
    await expect(tour(page).getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(scene(page).locator('.tour-pin')).toHaveCount(2)
    expect(await scene(page).locator('img').evaluate(async (img) => { await img.decode(); return img.naturalWidth })).toBeGreaterThan(0)
  }
  await tour(page).getByRole('button', { name: 'Next Scene' }).click()
  await expect(scene(page)).toHaveAttribute('data-tour-scene', 'entrance')
  await tour(page).getByRole('button', { name: 'Previous Scene' }).click()
  await expect(scene(page)).toHaveAttribute('data-tour-scene', 'table')
  await thumbs.getByRole('button', { name: 'Main Dining Area' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(scene(page)).toHaveAttribute('data-tour-scene', 'family')
  await expect(thumbs.getByRole('button', { name: 'Family Seating' })).toBeFocused()
})

test('hotspots reveal localized details, restore focus, and reset when the scene changes', async ({ page }) => {
  await openEnglish(page, '/uae#virtual-tour')
  const marker = scene(page).getByRole('button', { name: 'Olive Tree', exact: true })
  await marker.focus()
  await page.keyboard.press('Enter')
  await expect(marker).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#tour-detail')).toContainText('quiet patch of green')
  await tour(page).getByRole('button', { name: 'Close Detail' }).focus()
  await page.keyboard.press('Escape')
  await expect(marker).toBeFocused()
  await expect(marker).toHaveAttribute('aria-expanded', 'false')
  await marker.click()
  await tour(page).getByRole('button', { name: 'Next Scene' }).click()
  await expect(page.locator('#tour-detail')).toBeEmpty()
  await scene(page).getByRole('button', { name: 'Stone Arches' }).click()
  await expect(page.locator('#tour-detail')).toContainText('sightlines')
})

test('gallery lightbox supports captions, focus trapping, keyboard navigation and Escape', async ({ page }) => {
  await openEnglish(page, '/uae#gallery')
  const openingTile = gallery(page).getByRole('button', { name: /stone arches and olive upholstery/i })
  await openingTile.click()
  const dialog = page.getByRole('dialog', { name: 'Maramia Gallery Images' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Close Image Viewer' })).toBeFocused()
  await dialog.getByRole('button', { name: 'Next Image' }).click()
  await expect(dialog.locator('figcaption')).toHaveText('The terrace concept at dusk')
  await page.keyboard.press('ArrowRight')
  await expect(dialog.locator('figcaption')).toHaveText('A private table under a brass pendant')
  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('button', { name: 'Close Image Viewer' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Next Image' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(openingTile).toBeFocused()
})

test('tour seating link preselects the matching zone in the original booking flow', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-25T08:45:00Z'))
  await openEnglish(page, '/uae#virtual-tour')
  await tour(page).getByRole('button', { name: 'Outdoor Terrace', exact: true }).click()
  await tour(page).getByRole('link', { name: 'Reserve This Experience' }).click()
  await expect(page).toHaveURL(/\/reservation\?seating=terrace$/)
  await advanceToSeating(page)
  await expect(wizard(page).getByRole('button', { name: /^Outdoor Terrace/ })).toHaveAttribute('aria-pressed', 'true')
  await expect(wizard(page).getByRole('region', { name: 'Recommended Table' })).toContainText('preferred seating area')
})

test('collections link to existing dishes and keep both seating and occasion preferences', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-25T08:45:00Z'))
  await openEnglish(page, '/uae#dining-experiences')
  const card = (name) => page.getByRole('article', { name, exact: true })
  for (const [title, zone] of [
    ['Palestinian Family Table', 'family'], ['A Taste of Palestine', 'terrace'],
    ['Maramia Date Night', 'private'], ['Business Lunch', 'main'],
  ]) {
    await expect(card(title).getByRole('link', { name: 'Reserve This Experience' })).toHaveAttribute('href', new RegExp('seating=' + zone))
    await expect(card(title).getByRole('link', { name: 'Explore Our Menu' })).toHaveAttribute('href', '/menu')
  }
  const family = card('Palestinian Family Table')
  await family.getByRole('link', { name: 'Palestinian Maftoul' }).click()
  await expect(page.getByRole('dialog', { name: 'Palestinian Maftoul' })).toBeVisible()
  await page.goto('/uae#dining-experiences')
  await family.getByRole('link', { name: 'Reserve This Experience' }).click()
  await advanceToSeating(page)
  await expect(wizard(page).getByRole('button', { name: /^Family Seating/ })).toHaveAttribute('aria-pressed', 'true')
  await chooseTable(page, 'T08')
  await expect(wizard(page).getByRole('combobox', { name: 'Occasion' })).toHaveValue('gathering')
})

test('occasion links preselect valid settings and malformed query values fall back safely', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-25T08:45:00Z'))
  await openEnglish(page, '/uae')
  await page.locator('.occasion-links').getByRole('link', { name: 'Anniversary' }).click()
  await expect(page).toHaveURL(/seating=private&occasion=anniversary$/)
  await advanceToSeating(page)
  await expect(wizard(page).getByRole('button', { name: /^Private Dining/ })).toHaveAttribute('aria-pressed', 'true')
  await chooseTable(page, 'T18')
  await expect(wizard(page).getByRole('combobox', { name: 'Occasion' })).toHaveValue('anniversary')

  await page.goto('/reservation?seating=roof&occasion=__proto__')
  await advanceToSeating(page)
  await expect(wizard(page).getByRole('button', { name: 'Any Seating Area' })).toHaveAttribute('aria-pressed', 'true')
  await chooseTable(page, 'T01')
  await expect(wizard(page).getByRole('combobox', { name: 'Occasion' })).toHaveValue('casual')
})

test('reduced motion shows the new tour scene and lightbox photo without a transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openEnglish(page, '/uae')
  await tour(page).getByRole('button', { name: 'Private Dining', exact: true }).click()
  await expect(scene(page)).toHaveAttribute('data-tour-scene', 'private')
  expect(await scene(page).locator('img').evaluate((img) => ({
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    opacity: getComputedStyle(img).opacity,
    transform: getComputedStyle(img).transform,
  }))).toEqual({ reduced: true, opacity: '1', transform: 'none' })
  await gallery(page).getByRole('button').first().click()
  await page.getByRole('dialog').getByRole('button', { name: 'Next Image' }).click()
  expect(await page.getByRole('dialog').locator('img').evaluate((img) => getComputedStyle(img).opacity)).toBe('1')
})

for (const language of ['ar', 'en']) {
  test(`both editorial pages fit the five required widths in ${language}`, async ({ page }) => {
    const issues = []
    page.on('pageerror', (error) => issues.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') issues.push(message.text()) })
    page.on('response', (response) => { if (response.status() >= 400) issues.push(response.url()) })
    if (language === 'en') await openEnglish(page, '/about')
    for (const route of ['/about', '/uae']) {
      await page.goto(route)
      await expect(main(page).getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
      for (const width of [320, 375, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 850 })
        await page.evaluate(() => document.fonts.ready)
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
      }
      const images = await main(page).locator('img').evaluateAll(async (nodes) => Promise.all(nodes.map(async (img) => {
        img.loading = 'eager'
        await img.decode()
        return img.naturalWidth
      })))
      expect(images.length).toBeGreaterThan(6)
      expect(images.every(Boolean)).toBe(true)
    }
    await page.setViewportSize({ width: 375, height: 820 })
    await gallery(page).getByRole('button').last().click()
    const viewer = page.getByRole('dialog')
    await expect(viewer).toBeVisible()
    expect((await viewer.boundingBox()).width).toBeLessThanOrEqual(375)
    await expect(viewer.locator('figcaption')).toHaveText(language === 'ar'
      ? 'شجرة زيتون وحجر دافئ عند المدخل المقترح'
      : 'An olive tree and warm stone at the proposed entrance')
    expect(issues).toEqual([])
  })
}
