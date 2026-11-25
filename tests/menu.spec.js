import { expect, test } from '@playwright/test'

const catalog = (page) => page.locator('.menu-page-grid')
const cards = (page) => catalog(page).locator('[data-dish]')
const dish = (page, slug) => catalog(page).locator(`[data-dish="${slug}"]`)

async function selectEnglish(page) {
  await page.locator('header').getByRole('button', { name: 'Switch to English' }).click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
}

async function openEnglishMenu(page) {
  await page.goto('/menu')
  await selectEnglish(page)
}

test('all 49 items are represented in eight categories', async ({ page }) => {
  await openEnglishMenu(page)
  await expect(cards(page)).toHaveCount(49)
  const categories = page.getByRole('group', { name: 'Menu Categories' })
  await expect(categories.getByRole('button')).toHaveCount(9)
  for (const [name, count] of [
    ['Cold Mezze', 6], ['Hot Mezze', 10], ['Charcoal Grill', 8],
    ['Traditional Palestinian Dishes', 5], ['Side Dishes', 5], ['Desserts', 3],
    ['Cold Beverages', 10], ['Hot Beverages', 2],
  ]) {
    const button = categories.getByRole('button', { name, exact: true })
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect(cards(page)).toHaveCount(count)
  }
})

test('English search matches source spellings and case-insensitive ingredients', async ({ page }) => {
  await openEnglishMenu(page)
  const search = page.getByRole('searchbox', { name: 'Search the Menu' })
  await search.fill('  POMEGRANATE  ')
  await expect(cards(page)).toHaveCount(2)
  await expect(dish(page, 'moutabal')).toBeVisible()
  await search.fill('mousakhan')
  await expect(cards(page)).toHaveCount(1)
  await expect(dish(page, 'chicken-musakhan')).toBeVisible()
})

test('Arabic is the default and search tolerates vowel marks and elongation', async ({ page }) => {
  await page.goto('/menu')
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  const search = page.getByRole('searchbox', { name: 'ابحث في القائمة' })
  await search.fill('قَــهْوَة فِلَسْطِينِيَّة')
  await expect(cards(page)).toHaveCount(1)
  await expect(dish(page, 'palestinian-coffee')).toContainText('قهوة فلسطينية')
  await search.fill('حُــمُّص tahini')
  await expect(dish(page, 'hummus')).toBeVisible()
  await expect(dish(page, 'mixed-grill')).toHaveCount(0)
})

test('vegetarian filter shows only the 19 source-marked dishes', async ({ page }) => {
  await openEnglishMenu(page)
  await page.getByRole('checkbox', { name: 'Vegetarian Only' }).check()
  await expect(cards(page)).toHaveCount(19)
  await expect(catalog(page).locator('.vegetarian-tag')).toHaveCount(19)
  await expect(dish(page, 'garlic-sauce')).toHaveCount(0)
  await expect(dish(page, 'chicken-maftoul')).toHaveCount(0)
})

test('price sorting orders the full results numerically in either direction', async ({ page }) => {
  await openEnglishMenu(page)
  const sort = page.getByRole('combobox', { name: 'Sort Menu' })
  const prices = () => cards(page).evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute('data-price'))))
  await sort.selectOption('price-asc')
  const ascending = await prices()
  expect(ascending[0]).toBe(8)
  expect(ascending).toEqual([...ascending].sort((a, b) => a - b))
  await sort.selectOption('price-desc')
  const descending = await prices()
  expect(descending[0]).toBe(110)
  expect(descending).toEqual([...descending].sort((a, b) => b - a))
})

test('combined filters, empty results and reset work together', async ({ page }) => {
  await openEnglishMenu(page)
  await page.getByRole('button', { name: 'Cold Mezze', exact: true }).click()
  await page.getByRole('checkbox', { name: 'Vegetarian Only' }).check()
  const search = page.getByRole('searchbox', { name: 'Search the Menu' })
  await search.fill('tahini')
  await page.getByRole('combobox', { name: 'Sort Menu' }).selectOption('price-desc')
  await expect(cards(page)).toHaveCount(3)
  await expect(cards(page).nth(0)).toHaveAttribute('data-dish', 'gaza-salad')
  await expect(cards(page).nth(1)).toHaveAttribute('data-dish', 'moutabal')
  await expect(cards(page).nth(2)).toHaveAttribute('data-dish', 'hummus')
  await search.fill('green apples from mars')
  await expect(page.getByRole('heading', { name: 'No menu items found' })).toBeVisible()
  await page.locator('.menu-empty').getByRole('button', { name: 'Reset Filters' }).click()
  await expect(cards(page)).toHaveCount(49)
  await expect(search).toBeFocused()
  await expect(search).toHaveValue('')
  await expect(page.getByRole('checkbox', { name: 'Vegetarian Only' })).not.toBeChecked()
})

test('dish dialog shows ingredients and restores focus on Escape', async ({ page }) => {
  await openEnglishMenu(page)
  const link = dish(page, 'hummus').getByRole('link', { name: 'View Details Hummus' })
  await link.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/menu\?dish=hummus$/)
  const dialog = page.getByRole('dialog', { name: 'Hummus' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Close Dish Details' })).toBeFocused()
  await expect(dialog.getByRole('listitem').filter({ hasText: 'Tahini' })).toBeVisible()
  await expect(dialog.getByText('Vegetarian', { exact: true })).toBeVisible()
  await expect(dialog.getByTestId('unit-price')).toHaveText(/AED\s+28/)
  await page.keyboard.press('Tab')
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page).toHaveURL(/\/menu$/)
  await expect(link).toBeFocused()
})

test('portion, quantity and special instructions are editable in the selection preview', async ({ page }) => {
  await openEnglishMenu(page)
  await dish(page, 'charcoal-chicken').getByRole('link').click()
  const dialog = page.getByRole('dialog', { name: 'Charcoal-Grilled Chicken' })
  await expect(dialog.getByRole('radio', { name: /Half Chicken/ })).toBeChecked()
  await dialog.getByRole('radio', { name: /Whole Chicken/ }).check()
  await expect(dialog.getByTestId('unit-price')).toHaveText(/AED\s+108/)
  await dialog.getByRole('button', { name: 'Increase Quantity' }).click()
  await expect(dialog.getByTestId('selection-total')).toHaveText(/AED\s+216/)
  await dialog.getByRole('textbox', { name: 'Special Instructions' }).fill('Sauce on the side')
  await expect(dialog.getByRole('textbox', { name: 'Special Instructions' })).toHaveValue('Sauce on the side')
  await dialog.getByRole('button', { name: 'Close Dish Details' }).click()
  await page.goto('/menu?dish=still-water')
  const water = page.getByRole('dialog', { name: 'Still Mineral Water' })
  await water.getByRole('radio', { name: /Large/ }).check()
  await expect(water.getByTestId('unit-price')).toHaveText(/AED\s+19/)
  await water.getByRole('button', { name: 'Close Dish Details' }).click()
  await expect(page).toHaveURL(/\/menu$/)
})

test('homepage menu links and signature dish links reach the full menu', async ({ page }) => {
  await page.goto('/')
  await selectEnglish(page)
  await expect(page.locator('header').getByRole('link', { name: 'Our Restaurant' })).toBeVisible()
  await expect(page.locator('body')).not.toContainText(/Coming Soon|proposed UAE/i)
  await page.getByRole('link', { name: 'Explore Our Menu', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'The Maramia Menu' })).toBeVisible()
  await page.goto('/')
  const signature = page.locator('#menu [data-dish="chicken-musakhan"]')
  await signature.getByRole('link').click()
  await expect(page).toHaveURL(/\/menu\?dish=chicken-musakhan$/)
  const dialog = page.getByRole('dialog', { name: 'Chicken Musakhan' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Close Dish Details' }).click()
  await expect(page).toHaveURL(/\/menu$/)
  await expect(page.getByRole('heading', { name: 'The Maramia Menu' })).toBeFocused()
})

test('dining offers and the newsletter save anonymous, consented demo preferences', async ({ page }) => {
  await page.goto('/')
  await selectEnglish(page)
  const offers = page.locator('#offers form')
  await offers.getByLabel('Food interests (optional)').selectOption('vegetarian')
  await offers.getByLabel(/I agree to save/).check()
  await offers.getByRole('button', { name: 'Sign Up for Offers' }).click()
  await expect(offers.getByRole('status')).toContainText('saved in this browser')

  const newsletter = page.locator('#contact form')
  await newsletter.getByLabel('Dining occasions (optional)').selectOption('gathering')
  await newsletter.getByLabel(/I agree to save/).check()
  await newsletter.getByRole('button', { name: 'Subscribe' }).click()
  await expect(newsletter.getByRole('status')).toContainText('saved in this browser')
  await expect(page.locator('#offers form input[type=email], #contact form input[type=email]')).toHaveCount(0)
  const stored = await page.evaluate(() => ({
    events: JSON.parse(localStorage.getItem('maramia.analytics.v1')).events.filter(({ type }) => type === 'newsletter_submit'),
    legacy: localStorage.getItem('maramia.signup.opening'),
  }))
  expect(stored.legacy).toBeNull()
  expect(stored.events.map(({ preferences }) => preferences)).toEqual([{ food: 'vegetarian' }, { newsletterOccasion: 'gathering' }])
})

test('language switching translates the route and retains filters and preference', async ({ page }) => {
  await page.goto('/menu')
  await page.getByRole('button', { name: 'أطباق فلسطينية', exact: true }).click()
  await selectEnglish(page)
  await expect(page).toHaveTitle('The Maramia Menu | Maramia UAE')
  await expect(page.getByRole('button', { name: 'Traditional Palestinian Dishes' })).toHaveAttribute('aria-pressed', 'true')
  await expect(cards(page)).toHaveCount(5)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { name: 'The Maramia Menu' })).toBeVisible()
  await page.locator('header').getByRole('button', { name: 'التبديل إلى العربية' }).click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('heading', { name: 'قائمة مرامية' })).toBeVisible()
})

test('mobile Arabic category navigation stays sticky and can reach the final category', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/menu')
  await expect(cards(page)).toHaveCount(49)
  await page.evaluate(() => window.scrollTo(0, 920))
  const header = page.locator('.site-header')
  await expect(header).toHaveClass(/site-header--solid/)
  const categoryTrack = page.locator('.menu-category-track')
  const bar = await page.locator('.menu-category-bar').boundingBox()
  const masthead = await header.boundingBox()
  expect(Math.abs(bar.y - masthead.height)).toBeLessThanOrEqual(2)
  expect(await categoryTrack.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true)
  await categoryTrack.getByRole('button', { name: 'مشروبات ساخنة' }).click()
  await expect(cards(page)).toHaveCount(2)
  await page.getByRole('button', { name: 'إعادة ضبط الفلاتر' }).click()
  await expect(cards(page)).toHaveCount(49)
  expect(await categoryTrack.evaluate((node) => node.scrollLeft)).toBe(0)
})

for (const language of ['ar', 'en']) {
  test(`menu and dialog fit five widths in ${language}`, async ({ page }) => {
    const failures = []
    page.on('pageerror', (error) => failures.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') failures.push(message.text()) })
    page.on('response', (response) => { if (response.status() >= 400) failures.push(response.url()) })
    await page.goto('/menu')
    if (language === 'en') await selectEnglish(page)
    await expect(page.locator('.menu-category-track')).toBeVisible()

    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 850 })
      await page.evaluate(() => document.fonts.ready)
      const layout = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
        track: document.querySelector('.menu-category-track').getBoundingClientRect().width,
      }))
      expect(layout.content).toBe(layout.viewport)
      expect(layout.track).toBeLessThanOrEqual(layout.viewport)
      await dish(page, 'hummus').getByRole('link').click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      const bounds = await dialog.boundingBox()
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(850)
      expect(await dialog.evaluate((node) => node.scrollWidth === node.clientWidth)).toBe(true)
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
    }

    const decoded = await catalog(page).locator('img').evaluateAll(async (images) => {
      return Promise.all(images.map(async (image) => {
        image.loading = 'eager'
        await image.decode()
        return image.naturalWidth
      }))
    })
    expect(decoded).toHaveLength(48)
    expect(decoded.every(Boolean)).toBe(true)
    await expect(catalog(page).locator('.dish-image-fallback')).toHaveCount(1)
    expect(failures).toEqual([])
  })
}
