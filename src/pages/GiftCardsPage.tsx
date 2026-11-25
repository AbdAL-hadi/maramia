import '../styles/tools.css'
import { Download, Printer } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import giftImage from '../assets/hero.webp'
import { EditorialHero } from '../components/experience/EditorialHero'
import { GraphicPreview, type CanvasStatus } from '../components/marketing/GraphicPreview'
import { useLanguage } from '../context/LanguageContext'
import { coverImage, downloadPng, graphicFonts, graphicImage, paintText, paintWordmark } from '../data/canvasGraphics'
import { giftDesigns, giftValues, graphicImages } from '../data/graphicTemplates'
import { recordEvent } from '../data/marketingAnalytics'
import { aedCurrency } from '../data/menuFilters'
import type { CopyKey } from '../i18n/copy'
import '../styles/hospitality.css'

const cardWidth = 1440
const cardHeight = 900

export default function GiftCardsPage() {
  const { language, t } = useLanguage()
  const [value, setValue] = useState<number>(100)
  const [designId, setDesignId] = useState<string>('thanks')
  const [occasionId, setOccasionId] = useState<string>('thanks')
  const [greeting, setGreeting] = useState('')
  const [reference, setReference] = useState('')
  const [message, setMessage] = useState<CopyKey | null>(null)
  const [status, setStatus] = useState<CanvasStatus>('loading')
  const canvas = useRef<HTMLCanvasElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const design = giftDesigns.find((item) => item.id === designId) ?? giftDesigns[4]
  const occasion = giftDesigns.find((item) => item.id === occasionId) ?? giftDesigns[4]
  const formatted = aedCurrency[language].format(value)
  const title = t('giftTitle')
  const disclaimer = t('giftDemo')
  const draft = t('giftDraft')
  const draw = useCallback(async (ctx: CanvasRenderingContext2D) => {
    const rtl = language === 'ar'
    const [photo] = await Promise.all([graphicImage(graphicImages[design.image].src),
      graphicFonts(language, title + ' ' + disclaimer + ' ' + greeting + ' ' + occasion.name[language] + ' ' + formatted)])
    const panel = 845
    const textX = rtl ? cardWidth - panel + 63 : 63
    const textWidth = panel - 126
    ctx.fillStyle = design.color
    ctx.fillRect(0, 0, cardWidth, cardHeight)
    coverImage(ctx, photo, rtl ? 0 : panel, 0, cardWidth - panel, cardHeight - 100)
    ctx.strokeStyle = '#c4a270'
    ctx.lineWidth = 2
    ctx.strokeRect(textX - 25, 28, textWidth + 50, 730)
    paintWordmark(ctx, textX, 83, textWidth, '#f6ecd4', rtl)
    paintText(ctx, title, language, textX, 175, textWidth, 64, '#f6ecd4', 'display')
    paintText(ctx, occasion.name[language], language, textX, 270, textWidth, 34, '#ebc98f', 'strong')
    paintText(ctx, formatted, language, textX, 388, textWidth, 94, '#f6ecd4', 'display')
    paintText(ctx, greeting, language, textX, 515, textWidth, 34, '#f6ecd4', 'regular', 4)
    if (reference) paintWordmarkReference(ctx, reference, rtl ? textX + textWidth : textX, 705, rtl)
    else paintText(ctx, draft, language, textX, 705, textWidth, 30, '#ebc98f', 'strong')
    ctx.fillStyle = '#f2e6ca'
    ctx.fillRect(0, cardHeight - 100, cardWidth, 100)
    paintText(ctx, disclaimer, language, 63, cardHeight - 50, cardWidth - 126, 28, '#23392d', 'strong')
  }, [language, design, occasion, formatted, title, reference, disclaimer, draft, greeting])
  const ready = status === 'ready' && Boolean(reference)

  function revise(run: () => void) {
    run()
    setReference('')
    setMessage(null)
    setStatus('loading')
  }

  function focusPreview() {
    heading.current?.focus({ preventScroll: true })
    heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }

  function generate() {
    if (status !== 'ready') return
    const random = Array.from(crypto.getRandomValues(new Uint8Array(8)), (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()
    setReference('MR-G-' + random)
    setStatus('loading')
    setMessage('giftGenerated')
    void recordEvent('gift_generated')
    focusPreview()
  }

  async function download() {
    if (!ready || !canvas.current) return
    try {
      await downloadPng(canvas.current, 'maramia-gift-' + reference + '.png')
      setMessage('workspaceExported')
    } catch {
      setMessage('workspaceRenderError')
    }
  }

  return <div className="editorial-page gift-page">
    <EditorialHero variant="restaurant" image={giftImage} label={title} title={t('giftHero')} intro={t('giftIntro')}>
      <a className="button button--gold" href="#gift-design">{t('giftCustomize')}</a>
    </EditorialHero>
    <section className="editorial-section" id="gift-design" tabIndex={-1} aria-label={t('giftCustomize')}>
      <div className="container workspace-grid">
        <section className="report-panel workspace-controls" aria-labelledby="gift-settings">
          <h2 id="gift-settings">{t('giftCustomize')}</h2>
          <p className="report-note">{disclaimer}</p>
          <div className="workspace-fields">
            <label className="order-field">{t('giftValue')}
              <select value={value} onChange={(event) => {
                const next = Number(event.target.value)
                if (next !== value) revise(() => setValue(next))
              }}>
                {giftValues.map((amount) => <option key={amount} value={amount}>{aedCurrency[language].format(amount)}</option>)}
              </select>
            </label>
            <label className="order-field">{t('giftDesign')}
              <select value={designId} onChange={(event) => revise(() => setDesignId(event.target.value))}>
                {giftDesigns.map((entry) => <option key={entry.id} value={entry.id}>{entry.name[language]}</option>)}
              </select>
            </label>
            <label className="order-field">{t('giftOccasion')}
              <select value={occasionId} onChange={(event) => revise(() => setOccasionId(event.target.value))}>
                {giftDesigns.map((entry) => <option key={entry.id} value={entry.id}>{entry.name[language]}</option>)}
              </select>
            </label>
            <label className="order-field workspace-full">{t('giftGreeting')}
              <textarea dir="auto" rows={3} maxLength={150} value={greeting} onChange={(event) => revise(() => setGreeting(event.target.value))} />
            </label>
          </div>
          <p className="report-note">{t('giftPrivacy')}</p>
          <div className="report-actions">
            <button type="button" className="button button--forest" disabled={status !== 'ready'} onClick={generate}>{t('giftGenerate')}</button>
            <button type="button" className="button button--line" disabled={status !== 'ready'} onClick={() => {
              void recordEvent('gift_preview')
              focusPreview()
            }}>{t('giftPreview')}</button>
          </div>
        </section>
        <section className={'report-panel workspace-preview-card' + (ready ? ' phase8-printed' : '')} aria-labelledby="gift-preview-heading">
          <h2 id="gift-preview-heading" ref={heading} tabIndex={-1}>{t('workspacePreview')}</h2>
          <div className="graphic-stage graphic-stage-gift">
            <GraphicPreview canvas={canvas} width={cardWidth} height={cardHeight} draw={draw} status={status} setStatus={setStatus}
              locale={language} label={[title, occasion.name[language], formatted, greeting, disclaimer].filter(Boolean).join(' · ')} />
          </div>
          {reference && <p className="gift-reference"><bdi data-testid="gift-reference">{reference}</bdi></p>}
          <div className="report-actions">
            <button type="button" className="button button--forest" disabled={!ready} onClick={() => void download()}><Download size={17} aria-hidden="true" />{t('workspaceDownload')}</button>
            <button type="button" className="button button--line" disabled={!ready} onClick={() => window.print()}><Printer size={17} aria-hidden="true" />{t('giftPrint')}</button>
          </div>
          {message && <p role={message === 'workspaceRenderError' ? 'alert' : 'status'}>{t(message)}</p>}
        </section>
      </div>
    </section>
  </div>
}

function paintWordmarkReference(ctx: CanvasRenderingContext2D, reference: string, x: number, y: number, rtl: boolean) {
  ctx.font = '600 27px "DM Sans", sans-serif'
  ctx.fillStyle = '#ebc98f'
  ctx.textAlign = rtl ? 'right' : 'left'
  ctx.textBaseline = 'middle'
  ctx.direction = 'ltr'
  ctx.fillText(reference, x, y)
}
