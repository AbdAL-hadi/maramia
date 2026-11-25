import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

const fixedDate = '2026-11-25T08:45:00Z'
const day = '2026-11-26'
const welcome = '/offers/welcome-to-maramia'
const family = '/offers/palestinian-family-table'
const mezze = '/offers/maramia-mezze-night'
const referralLink = welcome + '?utm_source=instagram&utm_medium=influencer&utm_campaign=maramia_launch&ref=MIRA10'
const analytics = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('maramia.analytics.v1'))?.events ?? [])
const main = (page) => page.locator('main')
const metric = (page, name) => page.locator('[data-metric="' + name + '"] dd').first()

async function english(page, path = '/', date = fixedDate) {
  await page.clock.setFixedTime(new Date(date))
  await page.goto(path)
  if (await page.locator('html').getAttribute('lang') === 'ar') {
    await page.locator('header').getByRole('button', { name: 'Switch to English' }).click()
  }
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
}

async function addFromDialog(page) {
  const dish = page.getByRole('dialog')
  await dish.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(dish.getByText('Added to your cart.')).toBeVisible()
  await dish.getByRole('button', { name: 'Continue Shopping' }).click()
}

async function applyCode(page, code) {
  await page.locator('.promo-field input').fill(code)
  await page.locator('.promo-field button[type=submit]').click()
}

async function bookFamilyTable(page) {
  await page.goto(family)
  await page.locator('.editorial-hero').getByRole('link', { name: 'Reserve a Table', exact: true }).click()
  await expect(page).toHaveURL(/\/reservation\?seating=family&occasion=gathering$/)
  const wizard = page.locator('#reservation-wizard')
  const next = wizard.locator('button[type=submit]')
  await page.locator('[data-visit-date="' + day + '"]').click()
  await page.locator('[data-visit-time="720"]').click()
  await next.click()
  await expect(wizard.getByRole('button', { name: /^Family Seating/ })).toHaveAttribute('aria-pressed', 'true')
  await page.locator('[data-list-table="T08"]').click()
  await next.click()
  await expect(wizard.getByRole('combobox', { name: 'Occasion' })).toHaveValue('gathering')
  await page.locator('#booking-contact-name').fill('Private Demo Guest')
  await page.locator('#booking-contact-phone').fill('+971 50 123 4567')
  await page.locator('#booking-contact-email').fill('reservation-private@example.test')
  await next.click()
  await wizard.getByRole('button', { name: 'Confirm Demo Reservation' }).click()
  await expect(page.getByTestId('booking-reference')).toBeVisible()
}

test('home offers and navigation lead to the categorized hub with six campaign pages', async ({ page }) => {
  await english(page)
  const homeOffer = page.locator('#offers')
  await expect(homeOffer.getByRole('heading', { name: 'Welcome to Maramia' })).toBeVisible()
  await expect(homeOffer.getByText('WELCOME20')).toBeVisible()
  await expect(homeOffer.getByRole('link', { name: 'Discover Your Palestinian Table' })).toHaveAttribute('href', '/offers/table-quiz')
  await page.getByRole('banner').getByRole('link', { name: 'Offers', exact: true }).click()
  await expect(page).toHaveURL(/\/offers$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Good things to share')
  await expect(page.locator('[data-campaign]')).toHaveCount(6)
  await page.getByRole('button', { name: 'Dining', exact: true }).click()
  await expect(page.locator('[data-campaign]')).toHaveCount(3)
  await page.getByRole('button', { name: 'All Offers', exact: true }).click()
  await expect(page.locator('[data-campaign]')).toHaveCount(6)
  await expect(page.getByRole('banner').getByRole('link', { name: /marketing/i })).toHaveCount(0)
  await expect(page.locator('.offers-season')).toContainText('Maramia Mezze Night')
  await expect(page.locator('.offers-next').getByText('MARAMIA10')).toBeVisible()
  await expect(page.locator('.referral-list a')).toHaveCount(3)
})

test('each landing page has its own recommendations and invalid links recover', async ({ page }) => {
  await english(page, '/offers')
  const slugs = [
    ['welcome-to-maramia', 'Welcome to Maramia', 'Chicken Musakhan'],
    ['palestinian-family-table', 'Palestinian Family Table', 'Palestinian Maftoul'],
    ['business-lunch', 'Business Lunch', 'Shish Tawouk'],
    ['maramia-mezze-night', 'Maramia Mezze Night', 'Batata Harra'],
    ['taste-of-palestine', 'Taste of Palestine', 'Nabulsi Knafeh'],
    ['celebrations-at-maramia', 'Celebrations at Maramia', 'Mixed Grill'],
  ]
  for (const [slug, name, dish] of slugs) {
    await page.goto('/offers/' + slug)
    await expect(page).toHaveTitle(name + ' | Maramia UAE')
    await expect(main(page).getByRole('heading', { level: 1 })).toHaveText(name)
    await expect(page.locator('.campaign-dishes').getByRole('link', { name: new RegExp(dish) })).toHaveAttribute('href', /\/menu\?dish=/)
    await expect(page.getByRole('button', { name: 'Copy Campaign Link' })).toBeVisible()
  }
  await expect(page.locator('.occasion-links').getByRole('link', { name: 'Anniversary' })).toHaveAttribute('href', '/reservation?seating=private&occasion=anniversary')
  await page.goto('/offers/unknown?ref=MIRA10')
  await expect(main(page).getByRole('heading', { level: 1 })).toHaveText('Campaign not found')
  await main(page).getByRole('link', { name: 'Browse Offers' }).click()
  await expect(page).toHaveURL(/\/offers$/)
  expect((await analytics(page)).filter(({ type }) => type === 'referral_visit')).toHaveLength(0)
})

test('Dubai campaign dates govern scheduled and expired promos while existing codes still work', async ({ page }) => {
  await english(page, mezze, '2026-10-31T19:59:00Z')
  await expect(page.locator('.campaign-status')).toHaveText('Scheduled')
  await expect(page.locator('.campaign-offer')).toHaveCount(0)
  await page.goto('/menu?dish=hummus')
  await addFromDialog(page)
  await page.goto('/order')
  await applyCode(page, 'SALIM10')
  await expect(page.locator('.promo-feedback')).toContainText('invalid or inactive')

  await page.clock.setFixedTime(new Date('2026-10-31T20:00:00Z'))
  await page.goto(mezze)
  await expect(page.locator('.campaign-status')).toHaveText('Available in the demo')
  await expect(page.locator('#campaign-details .campaign-offer')).toContainText('SALIM10')
  await page.goto('/order')
  await expect(page.locator('.promo-active')).toContainText('SALIM10')

  await page.clock.setFixedTime(new Date('2027-02-28T20:00:00Z'))
  await page.goto(mezze + '?ref=SALIM10')
  await expect(page.locator('.campaign-status')).toHaveText('Ended')
  await page.goto('/order')
  await expect(page.locator('.promo-active')).toHaveCount(0)
  await applyCode(page, 'SALIM10')
  await expect(page.locator('.promo-feedback')).toContainText('invalid or inactive')
  await applyCode(page, 'MARAMIA10')
  await expect(page.locator('.promo-active')).toContainText('MARAMIA10')
  await applyCode(page, 'WELCOME20')
  await expect(page.locator('.promo-feedback')).toContainText('100')
})

test('welcome supports direct ordering and offers only preselect when the subtotal qualifies', async ({ page }) => {
  await english(page, welcome)
  await page.locator('.campaign-dishes').getByRole('link', { name: /Chicken Musakhan/ }).click()
  await addFromDialog(page)
  await page.goto(welcome)
  await page.locator('.editorial-hero').getByRole('link', { name: 'Order Online' }).click()
  await expect(page).toHaveURL(/\/order\?offer=WELCOME20$/)
  await expect(page.locator('.promo-active')).toHaveCount(0)
  await expect(page.locator('.promo-feedback')).toContainText('100')
  await page.goto('/menu?dish=chicken-musakhan')
  await addFromDialog(page)
  await page.goto('/order')
  await expect(page.locator('.promo-active')).toContainText('WELCOME20')
  await page.locator('.promo-active button').click()
  await expect(page.locator('.promo-active')).toHaveCount(0)
})

test('referral checkout and family reservation produce accurate, deduplicated attributed KPIs', async ({ page }) => {
  await english(page, referralLink)
  await expect(page.locator('#campaign-details .campaign-offer')).toContainText('MIRA10')
  await main(page).getByRole('link', { name: 'Terms and Eligibility', exact: true }).click()
  await expect(page).toHaveURL(/ref=MIRA10#campaign-details$/)
  await page.locator('.campaign-dishes').getByRole('link', { name: /Hummus/ }).click()
  await addFromDialog(page)
  await page.locator('header').getByRole('link', { name: 'Order Online', exact: true }).click()
  await expect(page.locator('.promo-active')).toContainText('MIRA10')
  await expect(page.locator('.promo-feedback')).toContainText('automatically applied')
  await page.getByRole('radio', { name: 'Pickup', exact: true }).check()
  await page.getByLabel('Pickup Time').selectOption('earliest')
  await page.locator('#maramia-checkout-form').getByLabel('Full name').fill('Private Demo Guest')
  await page.getByLabel('UAE Phone Number').fill('+971 50 123 4567')
  await page.locator('#maramia-checkout-form').getByLabel('Email address').fill('order-private@example.test')
  await page.getByRole('button', { name: 'Place Demo Order' }).click()
  await expect(page).toHaveURL(/\/order\/MRA-[A-F0-9]{10}$/)
  await page.reload()
  await bookFamilyTable(page)
  await page.reload()
  await page.goto('/marketing')

  await expect(metric(page, 'marketingOrders')).toHaveText('1')
  await expect(metric(page, 'marketingReservations')).toHaveText('1')
  await expect(metric(page, 'marketingVisits')).toHaveText('2')
  await expect(metric(page, 'marketingSessions')).toHaveText('1')
  await expect(metric(page, 'marketingRedemptions')).toHaveText('1')
  await expect(metric(page, 'marketingRevenue')).toContainText('25.2')
  await expect(metric(page, 'marketingOrderRate')).toHaveText('100%')
  await expect(metric(page, 'marketingReservationRate')).toHaveText('100%')
  await expect(page.getByRole('region', { name: 'Marketing Funnel' }).locator('li bdi')).toHaveText(['1', '1', '1', '1', '1'])
  await expect(page.locator('.report-referrals')).toContainText('MIRA10')
  const events = await analytics(page)
  expect(events.filter(({ type }) => type === 'referral_visit')).toEqual([expect.objectContaining({ campaignId: 'welcome', referral: 'MIRA10', source: 'influencer' })])
  expect(events.filter(({ type }) => type === 'order_completed')).toEqual([expect.objectContaining({ campaignId: 'welcome', referral: 'MIRA10', value: 2520 })])
  expect(events.filter(({ type }) => type === 'reservation_completed')).toEqual([expect.objectContaining({ campaignId: 'family', source: 'direct' })])
  expect(new Set(events.map(({ id }) => id)).size).toBe(events.length)
  expect(JSON.stringify(events)).not.toMatch(/@example|123-4567|Private Demo Guest/)
  await page.getByRole('combobox', { name: 'Acquisition Source', exact: true }).selectOption('influencer')
  await expect(metric(page, 'marketingOrders')).toHaveText('1')
  await expect(metric(page, 'marketingReservations')).toHaveText('0')
  await page.getByRole('combobox', { name: 'Acquisition Source', exact: true }).selectOption('')
  await page.getByRole('combobox', { name: 'Campaign', exact: true }).selectOption('family')
  await expect(metric(page, 'marketingOrders')).toHaveText('0')
  await expect(metric(page, 'marketingReservations')).toHaveText('1')

  await page.goto('/reservation/manage')
  await page.getByRole('button', { name: 'Cancel Reservation', exact: true }).click()
  await page.getByRole('button', { name: 'Yes, Cancel Reservation' }).click()
  await expect(main(page).getByRole('status')).toHaveText('Cancelled')
  await page.goto('/marketing')
  await expect(metric(page, 'marketingReservations')).toHaveText('0')
  await expect(metric(page, 'marketingReservationRate')).toHaveText('0%')
})

test('invalid ref values are ignored and campaign newsletter preferences stay anonymous', async ({ page }) => {
  await english(page, welcome + '?ref=unknown%40example.test&utm_source=instagram&utm_campaign=maramia_launch')
  const form = main(page).locator('.offers-signup form')
  await form.getByLabel('Food interests (optional)').selectOption('mezze')
  await form.getByLabel('Dining occasions (optional)').selectOption('birthday')
  await form.getByRole('button', { name: 'Subscribe' }).click()
  expect((await analytics(page)).some(({ type }) => type === 'newsletter_submit')).toBe(false)
  await form.getByLabel(/I agree to save/).check()
  await form.getByRole('button', { name: 'Subscribe' }).click()
  await expect(form.getByRole('status')).toContainText('No message was sent.')
  const events = await analytics(page)
  expect(events.filter(({ type }) => type === 'newsletter_submit')).toEqual([expect.objectContaining({
    campaignId: 'welcome', source: 'instagram', preferences: { food: 'mezze', newsletterOccasion: 'birthday' },
  })])
  expect(events.some(({ type }) => type === 'referral_visit')).toBe(false)
  expect(JSON.stringify(events)).not.toContain('unknown@example.test')
})

test('sharing preserves the valid referral with an accessible fallback and printable card', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined })
    Object.defineProperty(navigator, 'share', { value: undefined })
  })
  await english(page, referralLink)
  await page.getByRole('button', { name: 'Share Campaign', exact: true }).click()
  const field = page.getByLabel('Shareable link')
  await expect(field).toBeFocused()
  await expect(field).toHaveValue(/\/offers\/welcome-to-maramia\?.*ref=MIRA10/)
  const whatsApp = await page.getByRole('link', { name: 'Share on WhatsApp' }).getAttribute('href')
  expect(decodeURIComponent(whatsApp)).toContain('Welcome to Maramia')
  expect(decodeURIComponent(whatsApp)).toContain('ref=MIRA10')
  await page.getByRole('button', { name: 'Copy Campaign Link' }).click()
  await expect.poll(async () => (await analytics(page)).filter(({ type }) => type === 'share').map(({ method }) => method)).toEqual(['native', 'copy'])
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.campaign-print')).toBeVisible()
  await expect(page.locator('.campaign-print')).toContainText('MIRA10')
  await expect(page.locator('header.site-header')).toBeHidden()
})

test('quiz uses five preferences, offers reviewed vegetarian dishes and adds to the existing cart', async ({ page }) => {
  await english(page, '/offers/table-quiz')
  await page.getByRole('button', { name: 'Start the Quiz' }).click()
  const answers = ['Family gathering', 'Four guests', 'Vegetarian dishes', 'Room for the family', 'A full meal']
  for (const [index, label] of answers.entries()) {
    await expect(page.locator('.quiz-question h2')).toBeFocused()
    await page.getByRole('radio', { name: new RegExp(label) }).check()
    await page.getByRole('button', { name: index === 4 ? 'Show My Table' : 'Next Question' }).click()
  }
  const result = page.locator('.quiz-result')
  await expect(result.getByRole('heading')).toBeFocused()
  await expect(result).toContainText('Family Seating')
  await expect(result).toContainText('Palestinian Maftoul')
  await expect(result).not.toContainText('Chicken Musakhan')
  await expect(result.getByRole('link', { name: 'Reserve a Table' })).toHaveAttribute('href', '/reservation?seating=family&occasion=gathering')
  const checkboxes = result.getByRole('checkbox')
  const shown = await checkboxes.count()
  await checkboxes.last().uncheck()
  await result.getByRole('button', { name: 'Add Selected Dishes to Cart' }).click()
  await expect(result.getByRole('status')).toContainText('added to your cart')
  await expect(result.getByRole('button', { name: 'Add Selected Dishes to Cart' })).toBeDisabled()
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('maramia.ordering.v1')).cart)
  expect(cart).toHaveLength(shown - 1)
  expect(cart.map(({ itemId }) => itemId)).toContain('palestinian-maftoul')
  await page.goto('/marketing')
  await expect(metric(page, 'marketingQuizRate')).toHaveText('100%')
  await expect(page.getByRole('region', { name: 'Customer Preferences' })).toContainText('Vegetarian dishes')
})

test('dashboard separates synthetic data, exports aggregated CSV, and resets only analytics', async ({ page }) => {
  await english(page, '/menu')
  await page.goto('/menu?dish=hummus')
  await addFromDialog(page)
  await bookFamilyTable(page)
  await page.goto('/marketing')
  await expect(page.getByLabel('Dataset')).toHaveValue('local')
  await expect(metric(page, 'marketingReservations')).toHaveText('1')
  await page.getByLabel('Dataset').selectOption('sample')
  await expect(page.getByRole('status')).toContainText('separate synthetic sample')
  await expect(metric(page, 'marketingSessions')).toHaveText('12')
  await expect(metric(page, 'marketingVisits')).toHaveText('12')
  await page.getByRole('combobox', { name: 'Campaign', exact: true }).selectOption('welcome')
  await expect(metric(page, 'marketingVisits')).toHaveText('2')
  await page.getByLabel('From date').fill('2026-11-25')
  await expect(metric(page, 'marketingVisits')).toHaveText('1')
  const request = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export Aggregate CSV' }).click()
  const download = await request
  expect(download.suggestedFilename()).toBe('maramia-marketing-sample.csv')
  const csv = await readFile(await download.path(), 'utf8')
  expect(csv).toContain('"dataset","synthetic_sample"')
  expect(csv).toContain('"time_zone","Asia/Dubai"')
  expect(csv).toContain('"campaign_visits","1"')
  expect(csv).not.toMatch(/sessionId|@example|MRA-/)

  await page.getByRole('combobox', { name: 'Campaign', exact: true }).selectOption('')
  await page.getByLabel('Dataset').selectOption('local')
  await expect(metric(page, 'marketingReservations')).toHaveText('1')
  const snapshot = () => page.evaluate(() => ['maramia.ordering.v1', 'maramia.reservations.v1'].map((key) => localStorage.getItem(key)))
  const before = await snapshot()
  await page.getByRole('button', { name: 'Reset Analytics' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(metric(page, 'marketingReservations')).toHaveText('1')
  await page.getByRole('button', { name: 'Reset Analytics' }).click()
  await dialog.getByRole('button', { name: 'Clear Local Analytics' }).click()
  await expect(metric(page, 'marketingSessions')).toHaveText('0')
  await expect(metric(page, 'marketingReservations')).toHaveText('0')
  expect(await snapshot()).toEqual(before)
  expect(await analytics(page)).toEqual([])
})

for (const language of ['ar', 'en']) {
  test('marketing and campaign pages fit five widths in ' + language, async ({ page }) => {
    const failures = []
    page.on('pageerror', (error) => failures.push(error.message))
    page.on('console', (event) => { if (event.type() === 'error') failures.push(event.text()) })
    page.on('response', (response) => { if (response.status() >= 400 && response.url().includes('127.0.0.1:4180')) failures.push(response.url()) })
    await page.clock.setFixedTime(new Date(fixedDate))
    if (language === 'en') await english(page)
    for (const path of ['/offers', referralLink, '/offers/table-quiz', '/marketing']) {
      await page.goto(path)
      await expect(main(page).getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('lang', language)
      await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
      if (path === '/marketing') await page.locator('.report-fields select').last().selectOption('sample')
      if (path === '/offers/table-quiz') await page.locator('.editorial-hero button').click()
      for (const width of [320, 375, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 850 })
        await page.evaluate(() => document.fonts.ready)
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth), { message: path + ' at ' + width + 'px' }).toBe(width)
      }
      const sizes = await main(page).locator('img:visible').evaluateAll(async (images) => {
        for (const image of images) image.loading = 'eager'
        return Promise.all(images.map(async (image) => { await image.decode(); return image.naturalWidth }))
      })
      expect(sizes.every((size) => size > 0)).toBe(true)
    }
    expect(failures).toEqual([])
  })
}
