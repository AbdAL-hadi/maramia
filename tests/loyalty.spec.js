import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

const clock = '2026-11-25T08:45:00Z'
const orderingKey = 'maramia.ordering.v1'
const analyticsKey = 'maramia.analytics.v1'
const checkout = '#maramia-checkout-form'
const main = (page) => page.getByRole('main')
const ledger = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key))?.loyalty?.ledger ?? [], orderingKey)
const ordering = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), orderingKey)
const analytics = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key))?.events ?? [], analyticsKey)
const balance = (page) => page.getByTestId('loyalty-balance')
const metric = (page, name) => page.locator('[data-metric="' + name + '"] dd').first()

async function english(page, url = '/loyalty') {
  await page.clock.setFixedTime(new Date(clock))
  await page.goto(url)
  const language = page.getByRole('banner').getByRole('button', { name: 'Switch to English' })
  if (await page.locator('html').getAttribute('lang') === 'ar') await language.click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
}

async function join(page) {
  await page.locator('.editorial-hero').getByRole('button', { name: 'Join Rewards' }).click()
  await expect(balance(page)).toHaveText('50')
}

function transaction(type, points, extras = {}) {
  return { id: type, type, points, timestamp: Date.parse(clock) - 60000, ...extras }
}

async function seed(page, entries, orders = []) {
  await page.evaluate(({ entries, orders, key, now }) => localStorage.setItem(key, JSON.stringify({
    cart: [], orders, loyalty: {
      version: 1, id: 'MR-A00000000001', joinedAt: now - 120000, preferences: {}, ledger: entries,
    },
  })), { entries: [transaction('welcome', 50), ...entries], orders, key: orderingKey, now: Date.parse(clock) })
  await page.reload()
}

async function addItem(page, slug = 'hummus', quantity = 2) {
  await page.goto('/menu?dish=' + slug)
  const dialog = page.getByRole('dialog')
  for (let count = 1; count < quantity; count++) await dialog.getByRole('button', { name: 'Increase Quantity' }).click()
  await dialog.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(dialog.getByText('Added to your cart.')).toBeVisible()
}

async function applyPromo(page, code) {
  await page.locator('.promo-field input').fill(code)
  await page.locator('.promo-field button[type=submit]').click()
}

async function fillCheckout(page, mode = 'pickup') {
  if (mode === 'pickup') {
    await page.getByRole('radio', { name: 'Pickup', exact: true }).check()
    await page.getByLabel('Pickup Time').selectOption('earliest')
  } else {
    await page.getByLabel('Emirate').selectOption('dubai')
    await page.getByLabel('Area or District').fill('Sample District')
    await page.getByLabel('Building or Villa').fill('Sample Villa')
    await page.getByLabel('Address Details').fill('Sample Address')
  }
  await page.locator(checkout).getByLabel('Full name').fill('Demo Guest')
  await page.getByLabel('UAE Phone Number').fill('+971 50 123 4567')
  await page.locator(checkout).getByLabel('Email address').fill('private-demo@example.test')
}

async function placeOrder(page, doubleSubmit = false) {
  if (doubleSubmit) {
    await page.locator(checkout).evaluate((form) => { form.requestSubmit(); form.requestSubmit() })
  } else await page.getByRole('button', { name: 'Place Demo Order' }).click()
  await expect(page.getByTestId('order-number')).toBeVisible()
  return page.getByTestId('order-number').textContent()
}

async function completeOrder(page) {
  await page.getByRole('link', { name: 'Track Order' }).click()
  const advance = page.getByRole('button', { name: 'Advance Demo Status' })
  for (let step = 1; step <= 4; step++) {
    await advance.click()
    const index = page.locator('.tracking-timeline li').nth(step)
    await expect(index).toHaveAttribute('aria-current', 'step')
  }
  await expect(page.locator('.tracking-current h2')).toHaveText('Completed')
}

async function book(page) {
  await page.goto('/reservation')
  const wizard = page.locator('#reservation-wizard')
  const next = wizard.locator('button[type=submit]')
  await page.locator('[data-visit-date="2026-11-26"]').click()
  await page.locator('[data-visit-time="720"]').click()
  await next.click()
  await page.locator('[data-list-table="T01"]').click()
  await next.click()
  await page.locator('#booking-contact-name').fill('Sample Guest')
  await page.locator('#booking-contact-phone').fill('+971 50 123 4567')
  await page.locator('#booking-contact-email').fill('visit-private@example.test')
  await next.click()
  await wizard.getByRole('button', { name: 'Confirm Demo Reservation' }).click()
  await expect(page.getByTestId('booking-reference')).toBeVisible()
  return page.url()
}

test('enrollment persists with one welcome award and anonymous preferences', async ({ page }) => {
  await english(page, '/')
  await expect(page.locator('.home-rewards')).toContainText('50 welcome points')
  await page.locator('header').getByRole('link', { name: 'Maramia Rewards', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('MARAMIA REWARDS')
  await expect(page.locator('[data-reward]')).toHaveCount(6)
  await join(page)
  const id = await page.getByTestId('loyalty-member-id').textContent()
  expect(id).toMatch(/^MR-[A-F0-9]{12}$/)
  await expect(page.getByTestId('loyalty-card')).toHaveAttribute('data-tier', 'sage')
  await expect(page.getByTestId('loyalty-qualifying')).toHaveText('0')
  await expect(page.locator('.loyalty-next')).toContainText('50 more points')
  const form = page.locator('.loyalty-preferences')
  await form.getByRole('combobox', { name: /Food interests/ }).selectOption('vegetarian')
  await form.getByRole('combobox', { name: 'Suggested Seating' }).selectOption('terrace')
  await form.getByRole('button', { name: 'Save Changes' }).click()
  await expect(form.getByRole('status')).toContainText('Preferences saved')
  await page.reload()
  await expect(page.getByTestId('loyalty-member-id')).toHaveText(id)
  await expect(balance(page)).toHaveText('50')
  await expect(page.locator('.loyalty-preferences select').first()).toHaveValue('vegetarian')
  expect((await ledger(page)).map(({ type, points }) => [type, points])).toEqual([['welcome', 50]])
  const events = (await analytics(page)).filter(({ type }) => type === 'loyalty_join' || type === 'loyalty_welcome')
  expect(events).toHaveLength(2)
  expect(JSON.stringify(events)).not.toContain(id)
})

test('rapid enrollment from two tabs creates one shared membership and one welcome award', async ({ page, context }) => {
  await english(page)
  const second = await context.newPage()
  await second.clock.setFixedTime(new Date(clock))
  await second.goto('/loyalty')
  const control = (tab) => tab.locator('.editorial-hero').getByRole('button', { name: 'Join Rewards' })
  const buttons = await Promise.all([control(page).elementHandle(), control(second).elementHandle()])
  await Promise.all(buttons.map((button) => button.evaluate((element) => element.click())))
  await expect(balance(page)).toHaveText('50')
  await expect(balance(second)).toHaveText('50')
  expect(await second.getByTestId('loyalty-member-id').textContent()).toBe(await page.getByTestId('loyalty-member-id').textContent())
  expect((await ledger(page)).filter(({ type }) => type === 'welcome')).toHaveLength(1)
  await second.close()
})

test('orders award floored discounted food points only at Completed and deduplicate reloads', async ({ page }) => {
  await english(page)
  await join(page)
  await addItem(page, 'hummus', 3)
  await page.goto('/order')
  await fillCheckout(page, 'delivery')
  await applyPromo(page, 'MARAMIA10')
  await expect(page.getByTestId('loyalty-estimate')).toContainText('75 points')
  await expect(page.getByTestId('order-total')).toContainText('87.60')
  const id = await placeOrder(page)
  await expect(page.getByTestId('loyalty-order-message')).toContainText('tracking reaches Completed')
  expect(await ledger(page)).toHaveLength(1)
  await completeOrder(page)
  await expect(page.getByTestId('loyalty-order-message')).toContainText('75 points')
  await expect(page.locator('.order-tracking-reference .loyalty-notice')).toContainText('125 available points')
  await page.reload()
  await expect(page.getByTestId('loyalty-order-message')).toContainText('75 points')
  expect((await ledger(page)).filter(({ reference }) => reference === id)).toEqual([
    expect.objectContaining({ type: 'order', points: 75, earnedTier: 'sage' }),
  ])
  await page.goto('/loyalty')
  await expect(balance(page)).toHaveText('125')
  await expect(page.getByTestId('loyalty-qualifying')).toHaveText('75')
})

test('reward preview, promo conflict, atomic redemption, repeat KPIs, export, and reset', async ({ page }) => {
  await english(page)
  await join(page)
  await addItem(page)
  await page.goto('/order')
  await fillCheckout(page)
  await placeOrder(page)
  await completeOrder(page)
  await addItem(page)
  await page.goto('/order')
  await applyPromo(page, 'MARAMIA10')
  const reward = page.getByRole('combobox', { name: 'Reward for This Order' })
  await reward.selectOption('aed5')
  await expect(page.locator('.promo-active')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Use MARAMIA10 Instead/ })).toBeVisible()
  await expect(page.getByTestId('order-total')).toContainText('51')
  await page.getByRole('button', { name: 'Remove Reward' }).click()
  await expect(page.locator('.promo-active')).toContainText('MARAMIA10')
  expect((await ledger(page)).some(({ type }) => type === 'redeem')).toBe(false)
  await reward.selectOption('aed5')
  await fillCheckout(page)
  const reference = await placeOrder(page, true)
  await expect(main(page)).toContainText('AED 5 Dining Credit')
  const state = await ordering(page)
  expect(state.orders).toHaveLength(2)
  expect(state.orders[0]).toMatchObject({ id: reference, rewardId: 'aed5', amounts: { subtotal: 5600, discount: 500, total: 5100 } })
  await page.reload()
  expect((await ledger(page)).filter(({ reference: id, type }) => id === reference && type === 'redeem')).toEqual([
    expect.objectContaining({ points: -100, rewardId: 'aed5' }),
  ])
  await completeOrder(page)
  await page.goto('/loyalty')
  await expect(balance(page)).toHaveText('57')
  await expect(page.getByTestId('loyalty-qualifying')).toHaveText('107')
  await expect(main(page).getByText('Reward redemption', { exact: true }).first()).toBeVisible()
  await page.goto('/marketing')
  const report = page.getByRole('region', { name: 'Customer Retention', exact: true })
  await expect(report).toBeVisible()
  await expect(metric(page, 'retentionRepeatRate')).toHaveText('50%')
  await expect(metric(page, 'retentionEligibleAverage')).toContainText('53.5')
  await expect(metric(page, 'retentionRepeatRevenue')).toContainText('51')
  await expect(metric(page, 'retentionRedeemedPoints')).toHaveText('100')
  await expect(report.locator('.retention-distribution')).toContainText('AED 5 Dining Credit')
  expect((await analytics(page)).filter(({ type }) => type === 'loyalty_repeat_order')).toHaveLength(1)
  const nextDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export Aggregate CSV' }).click()
  const csv = await readFile(await (await nextDownload).path(), 'utf8')
  expect(csv).toContain('"repeat_order_rate","0.5"')
  expect(csv).toContain('"aed5","1"')
  expect(csv).not.toContain(reference)
  const saved = await ledger(page)
  await page.getByRole('button', { name: 'Reset Analytics' }).click()
  await page.getByRole('button', { name: 'Clear Local Analytics' }).click()
  await expect(metric(page, 'retentionRepeatRate')).toHaveText('0%')
  await expect(page.getByTestId('retention-qualifying')).toHaveText('107')
  expect(await ledger(page)).toEqual(saved)
})

test('insufficient, unavailable, and abandoned reward selections never debit the ledger', async ({ page }) => {
  await english(page)
  await join(page)
  await addItem(page)
  await page.goto('/order?reward=aed5')
  await expect(page.locator('.checkout-reward-selection')).toContainText('Insufficient points')
  await fillCheckout(page)
  await page.getByRole('button', { name: 'Place Demo Order' }).click()
  await expect(page.getByRole('alert')).toContainText('no longer eligible')
  await page.getByRole('button', { name: 'Remove Reward' }).click()
  await expect(page).toHaveURL(/\/order$/)
  await page.goto('/order?reward=unknown')
  await expect(page.locator('.checkout-reward-selection')).toContainText('unavailable')
  await page.goto('/loyalty')
  await expect(balance(page)).toHaveText('50')
  expect(await ledger(page)).toHaveLength(1)
  await page.goto('/order')
  await expect(page.getByRole('combobox', { name: 'Reward for This Order' })).toHaveValue('')
})

test('checkout save failure leaves both a valid reward and the cart available for retry', async ({ page }) => {
  await english(page)
  await seed(page, [transaction('adjustment', 50, { id: 'adjustment:fixture' })])
  await addItem(page)
  await page.goto('/order?reward=aed5')
  await expect(page.locator('.checkout-reward-selection')).toContainText('100 points are reserved')
  await fillCheckout(page)
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem
    window.restoreOrdering = () => { Storage.prototype.setItem = original }
    Storage.prototype.setItem = function (name, value) {
      if (name === key && JSON.parse(value).orders.length) throw new DOMException('Demo Failure', 'QuotaExceededError')
      return original.call(this, name, value)
    }
  }, orderingKey)
  await page.getByRole('button', { name: 'Place Demo Order' }).click()
  await expect(page.getByRole('alert')).toContainText('could not be saved')
  const before = await ordering(page)
  expect(before.orders).toHaveLength(0)
  expect(before.cart).toHaveLength(1)
  expect(before.loyalty.ledger).toHaveLength(2)
  await page.evaluate(() => window.restoreOrdering())
  await placeOrder(page)
  expect((await ledger(page)).filter(({ type }) => type === 'redeem')).toHaveLength(1)
})

test('an Olive tier upgrade uses the previous multiplier and redemption preserves the tier', async ({ page }) => {
  await english(page)
  await seed(page, [transaction('order', 480, { reference: 'MRA-0000000001', earnedTier: 'sage' })])
  await expect(page.getByTestId('loyalty-card')).toHaveAttribute('data-tier', 'sage')
  await addItem(page)
  await page.goto('/order')
  await fillCheckout(page)
  const first = await placeOrder(page)
  await completeOrder(page)
  await expect(page.getByTestId('loyalty-order-message')).toContainText('56 points')
  await addItem(page)
  await page.goto('/order?reward=aed5')
  await expect(page.getByTestId('loyalty-estimate')).toContainText('63 points')
  await fillCheckout(page)
  await placeOrder(page)
  await page.goto('/loyalty')
  await expect(balance(page)).toHaveText('486')
  await expect(page.getByTestId('loyalty-card')).toHaveAttribute('data-tier', 'olive')
  await expect(page.getByTestId('loyalty-qualifying')).toHaveText('536')
  expect((await analytics(page)).filter(({ type }) => type === 'loyalty_tier_upgrade')).toEqual([
    expect.objectContaining({ tier: 'olive', reference: first }),
  ])
})

test('Golden Olive uses 1.5× and complimentary coffee discounts exactly one current menu serving', async ({ page }) => {
  await english(page)
  await seed(page, [transaction('order', 1500, { reference: 'MRA-0000000001', earnedTier: 'olive' })])
  await expect(page.getByTestId('loyalty-card')).toHaveAttribute('data-tier', 'golden')
  await expect(page.locator('[data-reward="golden-table"]')).toContainText('Points and tier eligible')
  await addItem(page)
  await page.goto('/order?reward=coffee')
  await expect(page.locator('.checkout-reward-selection')).toContainText('below the minimum')
  await addItem(page, 'hummus', 1)
  await page.goto('/order?reward=coffee')
  await expect(page.locator('.checkout-reward-selection')).toContainText('Add the eligible item')
  await addItem(page, 'palestinian-coffee', 2)
  await page.goto('/order?reward=coffee')
  await expect(page.getByTestId('order-discount')).toContainText('19')
  await expect(page.getByTestId('loyalty-estimate')).toContainText('154 points')
  await fillCheckout(page)
  await placeOrder(page)
  await completeOrder(page)
  await expect(page.getByTestId('loyalty-order-message')).toContainText('154 points')
})

test('only due, uncancelled bookings can earn visit points and each reference earns once', async ({ page }) => {
  await english(page)
  await join(page)
  const url = await book(page)
  const action = page.getByRole('button', { name: 'Complete Demo Visit' })
  await expect(action).toBeDisabled()
  expect((await ledger(page)).filter(({ type }) => type === 'visit')).toHaveLength(0)
  await page.clock.setFixedTime(new Date('2026-11-26T08:00:00Z'))
  await page.reload()
  await action.click()
  await expect(page.getByTestId('visit-earned')).toBeVisible()
  await page.goto(url)
  await expect(action).toHaveCount(0)
  await expect(page.getByTestId('visit-earned')).toBeVisible()
  expect((await ledger(page)).filter(({ type }) => type === 'visit')).toEqual([expect.objectContaining({ points: 50 })])
  await page.goto('/loyalty')
  await expect(balance(page)).toHaveText('100')
  await expect(page.getByTestId('loyalty-qualifying')).toHaveText('50')
})

test('cancelled reservations remain ineligible after their scheduled Dubai time', async ({ page }) => {
  await english(page)
  await join(page)
  const url = await book(page)
  await page.getByRole('link', { name: 'Manage Reservation', exact: true }).click()
  await page.getByRole('button', { name: 'Cancel Reservation', exact: true }).click()
  await page.getByRole('button', { name: 'Yes, Cancel Reservation' }).click()
  await expect(main(page).getByRole('status')).toContainText('Cancelled')
  await page.clock.setFixedTime(new Date('2026-11-26T08:01:00Z'))
  await page.goto(url)
  await expect(main(page)).toContainText('Cancelled reservations earn no visit points')
  await expect(page.getByRole('button', { name: 'Complete Demo Visit' })).toHaveCount(0)
  expect(await ledger(page)).toHaveLength(1)
})

test('the ledger discards corrupt transactions and handles recognized reversals without changing qualifying points', async ({ page }) => {
  await english(page)
  await seed(page, [
    transaction('welcome', 50),
    transaction('redeem', -400, { reference: 'MRA-0000000003', rewardId: 'aed5' }),
    transaction('order', 530, { reference: 'MRA-0000000001', earnedTier: 'sage' }),
    transaction('adjustment', 20, { id: 'adjustment:fixture' }),
    transaction('redeem', -100, { reference: 'MRA-0000000002', rewardId: 'aed5' }),
    transaction('reversal', 100, { reverses: 'redeem:MRA-0000000002' }),
    transaction('reversal', 100, { reverses: 'redeem:MRA-0000000002' }),
  ])
  await expect(balance(page)).toHaveText('600')
  await expect(page.getByTestId('loyalty-qualifying')).toHaveText('530')
  const list = page.locator('.loyalty-history-all')
  await list.locator('summary').click()
  await expect(list.locator('[data-transaction="welcome"]')).toHaveCount(1)
  await expect(list.locator('[data-transaction="reversal"]')).toHaveCount(1)
  await expect(list.locator('[data-transaction="redeem"]')).toHaveCount(1)
})

test('past dish recommendations and reviewed reorder use current prices and legacy variants', async ({ page }) => {
  await english(page)
  const reference = 'MRA-0000000009'
  await seed(page, [], [{
    id: reference, stage: 4, mode: 'pickup', payment: 'cash', window: [20, 30],
    amounts: { subtotal: 8900, discount: 0, deliveryFee: 0, total: 8900 },
    items: [{
      itemId: 'charcoal-chicken', quantity: 1, unitPrice: 8900,
      name: { ar: 'Chicken', en: 'Old Chicken Label' }, variant: { ar: 'Whole', en: 'Whole Chicken' },
    }],
  }])
  await expect(page.locator('.loyalty-dish-list')).toContainText('Charcoal-Grilled Chicken')
  expect((await ordering(page)).cart).toHaveLength(0)
  const review = page.locator('.loyalty-reorder')
  await review.locator('summary').click()
  await expect(review).toContainText('Whole Chicken')
  await expect(review).toContainText('108')
  await expect(review).not.toContainText('89')
  await review.getByRole('button', { name: 'Add Selected Dishes to Cart' }).click()
  await expect(review.getByRole('status')).toContainText('added to your cart')
  expect((await ordering(page)).cart[0]).toMatchObject({ itemId: 'charcoal-chicken', variantId: 'whole', quantity: 1, instructions: '' })
})

test('presenter membership samples, past visit, print, and dashboard samples stay isolated', async ({ page }) => {
  await english(page)
  await join(page)
  const actual = await ordering(page)
  for (const [label, code] of [['Sage', 'sage'], ['Olive', 'olive'], ['Golden Olive', 'golden']]) {
    await page.getByRole('button', { name: 'Preview ' + label + ' Sample' }).click()
    await expect(page.getByTestId('loyalty-card')).toHaveAttribute('data-tier', code)
    await expect(page.getByTestId('loyalty-member-id')).toContainText('MR-DEMO')
    await expect(page.getByRole('link', { name: 'Select Reward' })).toHaveCount(0)
  }
  await page.getByRole('button', { name: 'Simulate a Completed Past Visit in Sample' }).click()
  await expect(main(page).getByText('Completed restaurant visit', { exact: true }).first()).toBeVisible()
  expect(await ordering(page)).toEqual(actual)
  expect((await analytics(page)).some(({ type }) => type === 'loyalty_visit_points')).toBe(false)
  await page.getByRole('button', { name: 'Exit Sample Scenario' }).click()
  await expect(balance(page)).toHaveText('50')
  await page.emulateMedia({ media: 'print' })
  await expect(page.getByTestId('loyalty-card')).toBeVisible()
  await expect(page.locator('.loyalty-catalog')).toBeHidden()
  await page.emulateMedia({ media: 'screen' })

  await page.goto('/marketing')
  await expect(page.getByTestId('retention-membership')).toContainText('Sage')
  await page.getByRole('combobox', { name: 'Dataset' }).selectOption('sample')
  await expect(page.getByTestId('retention-membership')).toContainText('Olive')
  await expect(metric(page, 'retentionRepeatRate')).toHaveText('50%')
  await page.getByRole('combobox', { name: 'Dataset' }).selectOption('local')
  await expect(page.getByTestId('retention-membership')).toContainText('Sage')
  await expect(metric(page, 'retentionRepeatRate')).toHaveText('0%')
})

for (const language of ['ar', 'en']) {
  test('rewards and checkout fit all requested widths in ' + language, async ({ page }) => {
    const failures = []
    page.on('pageerror', (error) => failures.push(error.message))
    page.on('console', (event) => { if (event.type() === 'error') failures.push(event.text()) })
    page.on('response', (response) => { if (response.status() >= 400 && response.url().includes('127.0.0.1:4180')) failures.push(response.url()) })
    await page.clock.setFixedTime(new Date(clock))
    if (language === 'en') await english(page)
    else await page.goto('/loyalty')
    await seed(page, [transaction('order', 1500, { reference: 'MRA-0000000001', earnedTier: 'olive' })])
    await expect(page.getByTestId('loyalty-card')).toHaveAttribute('data-tier', 'golden')
    for (const width of [320, 375, 768, 1024, 1120, 1240, 1440]) {
      await page.setViewportSize({ width, height: 835 })
      await page.evaluate(() => document.fonts.ready)
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
      if (width >= 1120) await expect(page.locator('.header-reserve')).toBeInViewport({ ratio: 1 })
    }
    const loaded = await main(page).locator('img').evaluateAll(async (images) => {
      for (const image of images) image.loading = 'eager'
      return Promise.all(images.map(async (image) => { await image.decode(); return image.naturalWidth }))
    })
    expect(loaded.length).toBeGreaterThanOrEqual(7)
    expect(loaded.every(Boolean)).toBe(true)
    await page.goto('/menu?dish=hummus')
    const add = language === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'
    await page.getByRole('dialog').getByRole('button', { name: add, exact: true }).click()
    await page.goto('/order?reward=golden-table')
    await expect(page.locator('.checkout-reward-selection')).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
    for (const width of [320, 375, 768, 1024, 1120, 1240, 1440]) {
      await page.setViewportSize({ width, height: 835 })
      await page.evaluate(() => document.fonts.ready)
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
    expect(failures).toEqual([])
  })
}
