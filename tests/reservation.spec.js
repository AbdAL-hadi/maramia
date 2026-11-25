import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

const day = '2026-11-26'
const storageKey = 'maramia.reservations.v1'
const wizard = (page) => page.locator('#reservation-wizard')
const next = (page) => wizard(page).getByRole('button', { name: 'Continue', exact: true })
const previous = (page) => wizard(page).getByRole('button', { name: 'Back', exact: true })
const slot = (page, minutes) => page.locator(`[data-visit-time="${minutes}"]`)
const planTable = (page, id) => page.locator(`[data-plan-table="${id}"]`)
const listTable = (page, id) => page.locator(`[data-list-table="${id}"]`)
const visitDate = (page, date) => page.locator(`[data-visit-date="${date}"]`)
const records = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey)

async function openReservation(page, language = 'en') {
  await page.clock.setFixedTime(new Date('2026-11-25T08:45:00Z'))
  await page.goto('/reservation')
  if (language === 'en' && await page.locator('html').getAttribute('lang') === 'ar') {
    await page.locator('header').getByRole('button', { name: 'Switch to English' }).click()
  }
}

async function chooseVisit(page, { date = day, guests = 2, time = 720 } = {}) {
  await visitDate(page, date).click()
  await wizard(page).locator('.visit-options select').selectOption(String(guests))
  await slot(page, time).click()
  await wizard(page).locator('button[type=submit]').click()
  await expect(page.locator('.restaurant-plan')).toBeVisible()
}

async function fillContact(page, { name = 'Demo Guest', phone = '+971 50 123 4567', email = 'guest@example.test' } = {}) {
  await page.locator('#booking-contact-name').fill(name)
  await page.locator('#booking-contact-phone').fill(phone)
  await page.locator('#booking-contact-email').fill(email)
}

async function prepareBooking(page, { id = 'T01', request, ...visit } = {}) {
  await chooseVisit(page, visit)
  await listTable(page, id).click()
  await next(page).click()
  await fillContact(page)
  if (request) await page.getByLabel('Special Requests (optional)').fill(request)
  await next(page).click()
  await expect(wizard(page).getByRole('button', { name: 'Confirm Demo Reservation' })).toBeVisible()
}

async function saveBooking(page) {
  await wizard(page).getByRole('button', { name: 'Confirm Demo Reservation' }).click()
  await expect(page).toHaveURL(/\/reservation\/MRA-R-[A-F0-9]{12}$/)
  return page.getByTestId('booking-reference').textContent()
}

test('validates Dubai dates and times and offers alternative slots', async ({ page }) => {
  await openReservation(page)
  await next(page).click()
  await expect(page.getByRole('alert')).toContainText('Choose an available date and time.')
  await expect(visitDate(page, '2026-11-24')).toBeDisabled()
  await visitDate(page, '2026-11-25').focus()
  await page.keyboard.press('ArrowRight')
  await expect(visitDate(page, day)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(visitDate(page, day)).toHaveAttribute('aria-pressed', 'true')
  await visitDate(page, '2026-11-25').click()
  await expect(slot(page, 720)).toBeDisabled()
  await expect(slot(page, 750)).toContainText('Past time')
  await expect(slot(page, 810)).toContainText('Fully booked')
  await expect(slot(page, 810)).toBeDisabled()
  await expect(page.getByRole('group', { name: 'Alternative Times' }).getByRole('button').first()).toBeEnabled()
  await expect(page.getByLabel('Number of Guests').locator('option')).toHaveCount(12)
  await page.getByRole('button', { name: 'Next Month' }).click()
  await expect(visitDate(page, '2026-12-01')).toBeEnabled()
})

test('renders 20 interactive tables, enforces capacity, and recommends efficient seating', async ({ page }) => {
  await openReservation(page)
  await chooseVisit(page, { guests: 4 })
  await expect(page.locator('[data-plan-table]')).toHaveCount(20)
  await expect(page.locator('.plan-room')).toHaveCount(4)
  await expect(planTable(page, 'T01')).toHaveAttribute('data-table-state', 'tooSmall')
  await expect(planTable(page, 'T07')).toHaveAttribute('data-table-state', 'reserved')
  await expect(planTable(page, 'T03')).toHaveAttribute('data-table-state', 'available')
  await next(page).click()
  await expect(page.getByRole('alert')).toContainText('Choose an available table')
  await planTable(page, 'T03').focus()
  await page.keyboard.press('Enter')
  await expect(planTable(page, 'T03')).toHaveAttribute('aria-pressed', 'true')
  await expect(listTable(page, 'T03')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('region', { name: 'Selected', exact: true })).toContainText('Main Dining · 4 Seats')
  await page.getByRole('button', { name: /^Outdoor Terrace/ }).click()
  await expect(page.getByRole('region', { name: 'Recommended Table' })).toContainText('preferred seating area')
  await page.getByRole('button', { name: 'Choose Recommended Table' }).click()
  await expect(planTable(page, 'T15')).toHaveAttribute('aria-pressed', 'true')
  await previous(page).click()
  await expect(page.getByLabel('Number of Guests')).toHaveValue('4')
  await expect(slot(page, 720)).toHaveAttribute('aria-pressed', 'true')
  await next(page).click()
  await expect(planTable(page, 'T15')).toHaveAttribute('aria-pressed', 'true')
})

test('recommends a private table for a celebration and preserves contact and requests on Back', async ({ page }) => {
  await openReservation(page)
  await chooseVisit(page)
  const recommended = page.getByRole('region', { name: 'Recommended Table' })
  await expect(recommended).toContainText('Table 01')
  await listTable(page, 'T01').click()
  await next(page).click()
  await page.getByRole('combobox', { name: 'Occasion', exact: true }).selectOption('birthday')
  await expect(recommended).toContainText('Table 18')
  await expect(recommended).toContainText('private setting')
  await page.getByRole('button', { name: 'Choose Recommended Table' }).click()
  await page.getByRole('checkbox', { name: 'Birthday Table Decoration' }).check()
  await fillContact(page, { phone: 'bad number' })
  await page.getByLabel('Special Requests (optional)').fill('Sample note for the demo')
  await next(page).click()
  await expect(page.locator('#booking-contact-phone')).toBeFocused()
  await expect(page.locator('#booking-contact-phone')).toHaveAttribute('aria-invalid', 'true')
  await page.locator('#booking-contact-phone').fill('+971 50 123 4567')
  await next(page).click()
  await expect(wizard(page)).toContainText('Private Dining')
  await expect(wizard(page)).toContainText('Birthday Table Decoration')
  await expect(wizard(page)).toContainText('Sample note for the demo')
  await previous(page).click()
  await expect(page.locator('#booking-contact-email')).toHaveValue('guest@example.test')
  await expect(page.getByRole('checkbox', { name: 'Birthday Table Decoration' })).toBeChecked()
})

test('creates a single private-data-free booking and exports a Dubai-time calendar event', async ({ page }) => {
  await openReservation(page)
  await prepareBooking(page, { request: 'Sample private note' })
  await wizard(page).evaluate((form) => { form.requestSubmit(); form.requestSubmit() })
  await expect(page).toHaveURL(/\/reservation\/MRA-R-[A-F0-9]{12}$/)
  const reference = await page.getByTestId('booking-reference').textContent()
  await expect(page.getByRole('heading', { level: 1, name: 'Demo Reservation Saved' })).toBeVisible()
  const stored = await records(page)
  expect(stored).toHaveLength(1)
  expect(stored[0]).toMatchObject({ id: reference, guests: 2, time: 720, duration: 90, tableId: 'T01', status: 'active' })
  expect(JSON.stringify(stored)).not.toMatch(/Demo Guest|example\.test|123 4567|phone|email|requests|Sample private note/)
  await page.reload()
  await expect(page.getByTestId('booking-reference')).toHaveText(reference)

  const downloadReady = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Add to Calendar' }).click()
  const download = await downloadReady
  expect(download.suggestedFilename()).toBe(reference + '.ics')
  const contents = await readFile(await download.path(), 'utf8')
  expect(contents).toContain('DTSTART:20261126T080000Z')
  expect(contents).toContain('DTEND:20261126T093000Z')
  expect(contents).toContain('STATUS:TENTATIVE')
  expect(contents).toContain('Maramia UAE')
  expect(contents).toContain(reference)
  expect(contents).not.toContain('LOCATION:')
})

test('modification releases the former table and cancellation releases the replacement', async ({ page }) => {
  await openReservation(page)
  await prepareBooking(page)
  const reference = await saveBooking(page)
  const bookingUrl = `/reservation/${reference}`
  await page.getByRole('link', { name: 'Manage Reservation', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Manage Reservations' })).toBeVisible()
  await expect(page.locator('#booking-' + reference)).toBeFocused()
  await page.getByRole('link', { name: 'Edit Reservation' }).click()
  await expect(page.getByLabel('Number of Guests')).toHaveValue('2')
  await expect(slot(page, 720)).toHaveAttribute('aria-pressed', 'true')
  await slot(page, 750).click()
  await next(page).click()
  await expect(planTable(page, 'T01')).toHaveAttribute('aria-pressed', 'true')
  await previous(page).click()
  await page.getByLabel('Number of Guests').selectOption('4')
  await next(page).click()
  await expect(planTable(page, 'T01')).toHaveAttribute('data-table-state', 'tooSmall')
  await listTable(page, 'T03').click()
  await next(page).click()
  await next(page).click()
  await page.getByRole('button', { name: 'Save Reservation Changes' }).click()
  await expect(page).toHaveURL(new RegExp(bookingUrl + '$'))
  expect(await records(page)).toEqual([expect.objectContaining({ id: reference, time: 750, tableId: 'T03', guests: 4 })])

  await page.goto('/reservation')
  await chooseVisit(page)
  await expect(planTable(page, 'T01')).toHaveAttribute('data-table-state', 'available')
  await expect(planTable(page, 'T03')).toHaveAttribute('data-table-state', 'reserved')
  await page.goto('/reservation/manage')
  await page.getByRole('button', { name: 'Cancel Reservation', exact: true }).click()
  await page.getByRole('button', { name: 'Yes, Cancel Reservation' }).click()
  await expect(page.locator('main').getByRole('status')).toHaveText('Cancelled')
  await page.reload()
  await expect(page.getByText('Cancelled', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Edit Reservation' })).toHaveCount(0)
  await page.goto(bookingUrl + '/edit')
  await expect(page.getByRole('heading', { name: 'Demo Reservation Unavailable' })).toBeVisible()
  await page.goto('/reservation')
  await chooseVisit(page, { guests: 4, time: 750 })
  await expect(planTable(page, 'T03')).toHaveAttribute('data-table-state', 'available')
})

test('two tabs cannot book overlapping intervals for the same table', async ({ page, context }) => {
  await openReservation(page)
  await prepareBooking(page)
  const second = await context.newPage()
  await openReservation(second)
  await prepareBooking(second, { time: 750 })
  await Promise.all([
    wizard(page).getByRole('button', { name: 'Confirm Demo Reservation' }).click(),
    wizard(second).getByRole('button', { name: 'Confirm Demo Reservation' }).click(),
  ])
  const saved = (target) => /\/reservation\/MRA-R-[A-F0-9]{12}$/.test(target.url())
  await expect.poll(() => [page, second].filter(saved).length).toBe(1)
  const declined = saved(page) ? second : page
  await expect(declined.getByRole('alert')).toContainText(/unavailable|Choose an available table/)
  await expect(planTable(declined, 'T01')).toHaveAttribute('data-table-state', 'reserved')
  expect(await records(declined)).toHaveLength(1)
})

test('past and corrupted records cannot be edited and the manager remains usable', async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify([
      { id: 'MRA-R-AAAAAAAAAAAA', date: '2026-10-01', time: 720, duration: 90, guests: 2, tableId: 'T01', status: 'active', occasion: 'casual', experiences: [] },
      { id: 'MRA-R-BBBBBBBBBBBB', date: '2026-02-31', time: 720, duration: 90, guests: 2, tableId: 'T01', status: 'active', occasion: 'casual' },
      { id: 'invalid' },
    ]))
  }, storageKey)
  await openReservation(page)
  await page.goto('/reservation/manage')
  await expect(page.locator('.booking-record')).toHaveCount(1)
  await expect(page.getByText('Past Visit', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Edit Reservation' })).toHaveCount(0)
  await page.goto('/reservation/MRA-R-AAAAAAAAAAAA/edit')
  await expect(page.getByRole('heading', { name: 'Demo Reservation Unavailable' })).toBeVisible()
})

for (const language of ['ar', 'en']) {
  test(`reservation layout and mobile table list work in ${language}`, async ({ page }) => {
    const issues = []
    page.on('pageerror', (error) => issues.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') issues.push(message.text()) })
    page.on('response', (response) => { if (response.status() >= 400) issues.push(response.url()) })
    await openReservation(page, language)
    await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
    await chooseVisit(page, { guests: 12 })
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 850 })
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
    const cards = await page.locator('.seating-area img').evaluateAll(async (images) => {
      await Promise.all(images.map((image) => { image.loading = 'eager'; return image.decode() }))
      return images.map((image) => image.getAttribute('src'))
    })
    expect(new Set(cards).size).toBe(4)
    await page.setViewportSize({ width: 375, height: 820 })
    await listTable(page, 'T20').click()
    await expect(listTable(page, 'T20')).toHaveAttribute('aria-pressed', 'true')
    await expect(planTable(page, 'T20')).toHaveAttribute('aria-pressed', 'true')
    await expect(planTable(page, 'T19')).toHaveAttribute('aria-disabled', 'true')
    await expect(page.locator('#floor-heading')).toHaveText(language === 'ar' ? 'مخطّط المطعم المقترح' : 'Proposed Restaurant Floor Plan')
    expect(issues).toEqual([])
  })
}
