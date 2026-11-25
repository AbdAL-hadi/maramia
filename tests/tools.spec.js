import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { expect, test } from '@playwright/test'

const require = createRequire(import.meta.url)
const clock = '2026-11-25T08:45:00Z'
const main = (page) => page.getByRole('main')
const metric = (page, name) => page.locator('[data-metric="' + name + '"] dd').first()
const analytics = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('maramia.analytics.v1'))?.events ?? [])

async function open(page, path, language = 'en') {
  await page.clock.setFixedTime(new Date(clock))
  if (language === 'en') await page.addInitScript(() => localStorage.setItem('maramia.language', JSON.stringify('en')))
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('lang', language)
  await expect(main(page).getByRole('heading', { level: 1 })).toBeVisible()
}

async function download(page, button) {
  const event = page.waitForEvent('download')
  await button.click()
  const file = await event
  return { name: file.suggestedFilename(), bytes: await readFile(await file.path()) }
}

function pngSize(bytes) {
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  expect(bytes.byteLength).toBeGreaterThan(5000)
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)]
}

async function decodeQr(page, bytes) {
  await page.addScriptTag({ path: require.resolve('jsqr') })
  return page.evaluate(async (png) => {
    const image = new Image()
    image.src = 'data:image/png;base64,' + png
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return window.jsQR(frame.data, frame.width, frame.height)?.data ?? null
  }, bytes.toString('base64'))
}

test('studio provides six templates, live bilingual designs, PNG exports, and a reset', async ({ page }) => {
  await open(page, '/marketing/studio')
  await expect(page.getByRole('combobox', { name: 'Design Template' }).locator('option')).toHaveCount(6)
  await page.getByRole('combobox', { name: 'Design Template' }).selectOption('offer')
  await expect(page.getByRole('textbox', { name: 'Promotional Code' })).toHaveValue('WELCOME20')
  const graphic = main(page).getByRole('img', { name: /Welcome to Maramia/ })
  await expect(graphic).toBeVisible()
  await page.getByRole('textbox', { name: 'Headline' }).fill('Maramia for your table')
  const custom = main(page).getByRole('img', { name: /Maramia for your table/ })
  await expect(custom).toBeVisible()
  await page.getByRole('button', { name: 'Reset Template' }).click()
  await expect(graphic).toBeVisible()
  const button = page.getByRole('button', { name: 'Download PNG' })
  const en = await download(page, button)
  expect(en.name).toBe('maramia-offer-post-en.png')
  expect(pngSize(en.bytes)).toEqual([1080, 1080])

  await page.getByRole('combobox', { name: 'Graphic Language' }).selectOption('ar')
  await page.getByRole('combobox', { name: 'Graphic Format' }).selectOption('story')
  await expect(main(page).getByRole('img', { name: /أهلًا بكم في مرامية/ })).toBeVisible()
  const ar = await download(page, button)
  expect(ar.name).toBe('maramia-offer-story-ar.png')
  expect(pngSize(ar.bytes)).toEqual([1080, 1920])
  expect(await page.evaluate(() => document.fonts.check('700 70px Cairo', 'أهلًا بكم'))).toBe(true)
  await page.getByRole('combobox', { name: 'Graphic Format' }).selectOption('banner')
  expect(pngSize((await download(page, button)).bytes)).toEqual([1920, 1080])
  await expect.poll(async () => (await analytics(page)).filter(({ type }) => type === 'graphic_generated').length).toBe(3)
})

test('studio copy controls return captions, hashtags, and a configured campaign link when clipboard access is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
  })
  await open(page, '/marketing/studio')
  await page.getByRole('combobox', { name: 'Design Template' }).selectOption('offer')
  const text = page.getByRole('textbox', { name: 'Text to Copy' })
  await page.getByRole('button', { name: 'Copy Caption' }).click()
  await expect(text).toBeFocused()
  await expect(text).toHaveValue(/WELCOME20/)
  await page.getByRole('button', { name: 'Copy Hashtags' }).click()
  await expect(text).toHaveValue(/#MaramiaUAE/)
  await page.getByRole('button', { name: 'Copy Campaign Link' }).click()
  await expect(text).toHaveValue(/\/offers\/welcome-to-maramia$/)
})

test('link builder saves anonymous settings and attributes UTM-tagged menu visits to an existing campaign', async ({ page }) => {
  await open(page, '/marketing/links')
  await page.getByRole('combobox', { name: 'Destination Page' }).selectOption('dish')
  await page.getByRole('combobox', { name: 'Menu Item' }).selectOption('chicken-musakhan')
  await page.getByRole('combobox', { name: 'Linked Campaign' }).selectOption('taste')
  await page.getByRole('combobox', { name: 'Marketing Source' }).selectOption('tiktok')
  await page.getByRole('combobox', { name: 'Marketing Medium' }).selectOption('social')
  await page.getByRole('textbox', { name: 'Tracking Campaign Name' }).fill('Palestinian table launch')
  const preview = page.getByTestId('campaign-url')
  const url = new URL(await preview.textContent())
  expect(url.pathname).toBe('/menu')
  expect(Object.fromEntries(url.searchParams)).toMatchObject({
    dish: 'chicken-musakhan', utm_source: 'tiktok', utm_medium: 'social', utm_campaign: 'palestinian-table-launch', utm_id: 'maramia_taste',
  })
  await page.getByRole('button', { name: 'Generate Campaign Link' }).click()
  await page.getByRole('button', { name: 'Save Link Settings' }).click()
  await expect(page.getByRole('button', { name: /palestinian-table-launch/ })).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: /palestinian-table-launch/ }).click()
  await expect(preview).toHaveText(url.href)
  await page.goto(url.href)
  await expect(page.getByRole('dialog', { name: /Chicken Musakhan/ })).toBeVisible()
  await expect.poll(async () => (await analytics(page)).some((entry) => entry.type === 'campaign_visit'
    && entry.campaignId === 'taste' && entry.source === 'tiktok')).toBe(true)
  await expect.poll(async () => (await analytics(page)).some((entry) => entry.type === 'item_view' && entry.source === 'tiktok')).toBe(true)
  await page.goto('/marketing')
  await page.getByRole('combobox', { name: 'Acquisition Source' }).selectOption('tiktok')
  await expect(metric(page, 'marketingVisits')).toHaveText('1')
  await page.getByRole('button', { name: 'Reset Analytics' }).click()
  await page.getByRole('button', { name: 'Clear Local Analytics' }).click()
  await page.goto('/marketing/links')
  await expect(page.getByRole('button', { name: /palestinian-table-launch/ })).toBeVisible()
})

test('QR generator exports an independently decodable branded PNG and prints only the card', async ({ page }) => {
  await open(page, '/marketing/links')
  await page.getByRole('combobox', { name: 'Referral Code (optional)' }).selectOption('MIRA10')
  await expect(page.locator('.workspace-fields option[value=MIRA10]')).toHaveText('Welcome Partner Link')
  await page.getByRole('button', { name: 'Generate Campaign Link' }).click()
  const target = await page.getByTestId('campaign-url').textContent()
  await page.getByRole('link', { name: 'Generate QR Code' }).click()
  await expect(page.getByTestId('qr-target')).toHaveText(target)
  await expect(main(page)).toContainText('may be unreachable from other devices')
  await page.getByRole('textbox', { name: 'Card Title' }).fill('مائدة مرامية')
  await page.getByRole('combobox', { name: 'Graphic Language' }).selectOption('ar')
  await expect(main(page).getByRole('img', { name: /مائدة مرامية/ })).toBeVisible()
  await page.getByRole('button', { name: 'Generate QR Code' }).click()
  const png = await download(page, page.getByRole('button', { name: 'Download PNG' }))
  expect(png.name).toBe('maramia-qr-custom.png')
  expect(pngSize(png.bytes)).toEqual([920, 1080])
  expect(await decodeQr(page, png.bytes)).toBe(target)
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.phase8-printed canvas')).toBeVisible()
  await expect(page.locator('.workspace-controls')).toBeHidden()
  await page.emulateMedia({ media: 'screen' })
  await page.getByRole('textbox', { name: 'Custom Tracking URL' }).fill('javascript:alert(1)')
  await expect(page.getByRole('button', { name: 'Generate QR Code' })).toBeDisabled()
  await expect(main(page)).toContainText('Enter a valid HTTP or HTTPS URL')
})

test('gift cards customize value, occasion, design, and greeting without saving personal text or recording revenue', async ({ page }) => {
  await open(page, '/gift-cards')
  await page.getByRole('combobox', { name: 'Demo Gift Value' }).selectOption('200')
  await page.getByRole('combobox', { name: 'Card Design' }).selectOption('ramadan')
  await main(page).getByRole('combobox', { name: 'Occasion', exact: true }).selectOption('anniversary')
  const greeting = 'Private greeting for Samira'
  await page.getByRole('textbox', { name: /Greeting/ }).fill(greeting)
  await expect(main(page).getByRole('img', { name: /Anniversary.*200.*Private greeting/ })).toBeVisible()
  await page.getByRole('button', { name: 'Preview Gift Card' }).click()
  await expect(page.locator('#gift-preview-heading')).toBeFocused()
  await page.getByRole('button', { name: 'Generate Demo Gift Card' }).click()
  const reference = await page.getByTestId('gift-reference').textContent()
  expect(reference).toMatch(/^MR-G-[A-F0-9]{16}$/)
  await expect(main(page)).toContainText('no monetary or redemption value')
  const png = await download(page, page.getByRole('button', { name: 'Download PNG' }))
  expect(png.name).toContain(reference)
  expect(pngSize(png.bytes)).toEqual([1440, 900])
  const log = await analytics(page)
  expect(log.filter(({ type }) => type === 'gift_generated')).toHaveLength(1)
  expect(log.filter(({ type }) => type === 'gift_preview')).toHaveLength(1)
  expect(log.some(({ type }) => type === 'order_completed')).toBe(false)
  const storage = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))
  expect(storage).not.toContain(greeting)
  expect(storage).not.toContain(reference)
  await page.reload()
  await expect(page.getByRole('textbox', { name: /Greeting/ })).toHaveValue('')
  await expect(page.getByTestId('gift-reference')).toHaveCount(0)
})

test('optional feedback aggregates valid answers, handles zero, and separates sample scores', async ({ page }) => {
  await open(page, '/feedback')
  const submit = page.getByRole('button', { name: 'Submit Feedback' })
  await submit.click()
  await expect(main(page).getByRole('alert')).toContainText('Choose at least one rating')
  await page.locator('fieldset[name=food]').getByRole('radio', { name: '5', exact: true }).check()
  await page.locator('fieldset[name=overall]').getByRole('radio', { name: '5', exact: true }).check()
  await page.locator('fieldset[name=ordering]').getByRole('radio', { name: '5', exact: true }).check()
  await page.locator('fieldset[name=recommendation]').getByRole('radio', { name: '10', exact: true }).check()
  await submit.click()
  await expect(main(page).getByRole('status')).toContainText('anonymous ratings were saved')
  await expect(submit).toBeDisabled()
  await page.reload()
  await page.locator('fieldset[name=food]').getByRole('radio', { name: '3', exact: true }).check()
  await page.locator('fieldset[name=overall]').getByRole('radio', { name: '3', exact: true }).check()
  await page.locator('fieldset[name=reservation]').getByRole('radio', { name: '4', exact: true }).check()
  await page.locator('fieldset[name=recommendation]').getByRole('radio', { name: '0', exact: true }).check()
  await submit.click()
  await expect(main(page).getByRole('status')).toBeVisible()
  const responses = (await analytics(page)).filter(({ type }) => type === 'customer_feedback')
  expect(responses.map(({ ratings }) => ratings)).toEqual([
    { food: 5, ordering: 5, overall: 5, recommendation: 10 }, { food: 3, reservation: 4, overall: 3, recommendation: 0 },
  ])
  await page.goto('/marketing')
  await expect(metric(page, 'feedbackResponses')).toHaveText('2')
  await expect(metric(page, 'feedback-overall')).toHaveText('4 / 5')
  await expect(metric(page, 'feedback-food')).toHaveText('4 / 5')
  await expect(metric(page, 'feedback-ordering')).toHaveText('5 / 5')
  await expect(metric(page, 'feedback-reservation')).toHaveText('4 / 5')
  await expect(metric(page, 'feedback-hospitality')).toHaveText('—')
  await expect(metric(page, 'feedback-recommendation')).toHaveText('5 / 10')
  await expect(metric(page, 'feedback-nps')).toHaveText('0')
  await page.getByRole('combobox', { name: 'Dataset' }).selectOption('sample')
  await expect(metric(page, 'feedbackResponses')).toHaveText('4')
  await expect(metric(page, 'feedback-nps')).toHaveText('25')
  await page.getByRole('combobox', { name: 'Dataset' }).selectOption('local')
  await expect(metric(page, 'feedbackResponses')).toHaveText('2')
})

test('contact validates local input, exposes pending details, and leaves personal information out of storage', async ({ page }) => {
  await open(page, '/')
  await page.getByRole('banner').getByRole('link', { name: 'Contact', exact: true }).click()
  await expect(page).toHaveURL(/\/contact$/)
  const details = page.locator('.reach-details')
  await expect(details.getByText('Pending confirmation')).toHaveCount(4)
  await expect(main(page).locator('a[href^="tel:"], a[href^="mailto:"]')).toHaveCount(0)
  await expect(main(page).getByRole('link', { name: 'Maramia Palestine on Facebook' })).toHaveAttribute('href', 'https://www.facebook.com/MaramiaCafeAndRestaurants')
  const form = page.getByRole('form', { name: 'Demo Contact Form' })
  await form.getByRole('button', { name: 'Validate Demo Message' }).click()
  await expect(form.locator('input[name=name]')).toBeFocused()
  await form.locator('input[name=name]').fill('Private Demo Guest')
  await form.locator('input[name=email]').fill('mistyped')
  await form.locator('textarea[name=message]').fill('Personal details only used for this validation example.')
  await form.getByRole('combobox', { name: 'Inquiry Topic' }).selectOption('private')
  await form.getByRole('button', { name: 'Validate Demo Message' }).click()
  await expect(form.locator('input[name=email]')).toBeFocused()
  await form.locator('input[name=email]').fill('private-demo@example.test')
  await form.getByRole('button', { name: 'Validate Demo Message' }).click()
  await expect(form.getByRole('status')).toContainText('neither sent nor saved')
  await expect(form.locator('textarea')).toHaveValue('')
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toMatch(/Private Demo Guest|private-demo@example|Personal details only/)
})

test('FAQ search respects both locales, and native accordions work with the keyboard', async ({ page }) => {
  await open(page, '/faq', 'ar')
  const search = main(page).getByRole('searchbox')
  await search.fill('إلغاء الحَجز')
  await expect(main(page).locator('.faq-accordion details')).toHaveCount(1)
  const question = main(page).locator('summary')
  await question.focus()
  await page.keyboard.press('Enter')
  await expect(main(page).locator('details[open]')).toHaveCount(1)
  await page.getByRole('banner').getByRole('button', { name: 'Switch to English' }).click()
  await search.fill('gift card')
  await expect(main(page).locator('summary')).toHaveText('Can I redeem a gift card at the restaurant?')
  await page.locator('summary').click()
  await expect(main(page).getByRole('link', { name: 'Design a Gift Card' })).toHaveAttribute('href', '/gift-cards')
  await search.fill('no-match-here')
  await expect(main(page).getByRole('status')).toContainText('No questions match')
})

test('dashboard links all tools and counts finalized work separately from simulated sales', async ({ page }) => {
  await open(page, '/marketing')
  const tools = page.getByRole('navigation', { name: 'Marketing Tools' })
  for (const [name, url] of [
    ['Social Media Content Studio', '/marketing/studio'], ['Campaign Link Builder', '/marketing/links'],
    ['QR Code Generator', '/marketing/qr'], ['Customer Feedback Analytics', '#feedback-analytics'],
  ]) await expect(tools.getByRole('link', { name })).toHaveAttribute('href', url)
  await tools.getByRole('link', { name: 'QR Code Generator' }).click()
  await page.getByRole('button', { name: 'Generate QR Code' }).click()
  await page.getByRole('link', { name: 'Marketing Dashboard' }).click()
  await expect(metric(page, 'toolsQrCount')).toHaveText('1')
  await expect(metric(page, 'marketingOrders')).toHaveText('0')
  await expect(metric(page, 'marketingSessions')).toHaveText('0')
  await page.getByRole('combobox', { name: 'Dataset' }).selectOption('sample')
  await expect(metric(page, 'toolsQrCount')).toHaveText('0')
  await page.goto('/')
  await expect(page.getByRole('banner').locator('a[href^="/marketing"]')).toHaveCount(0)
  await expect(page.locator('footer')).toContainText('Gift Cards')
  await expect(page.locator('footer')).toContainText('Guest Feedback')
})

for (const language of ['ar', 'en']) {
  test('Phase Eight pages fit the five required widths in ' + language, async ({ page }) => {
    const errors = []
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('response', (response) => { if (response.status() >= 400 && response.url().includes('127.0.0.1:4180')) errors.push(response.url()) })
    await open(page, '/marketing/studio', language)
    for (const url of ['/marketing/studio', '/marketing/links', '/marketing/qr', '/gift-cards', '/feedback', '/contact', '/faq', '/marketing']) {
      await page.goto(url)
      await expect(main(page).getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
      for (const width of [320, 375, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 850 })
        await page.evaluate(() => document.fonts.ready)
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth), { message: url + ' at ' + width }).toBe(width)
      }
    }
    expect(errors).toEqual([])
  })
}
