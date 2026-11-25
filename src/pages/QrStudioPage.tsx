import { Download, Printer } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { DestinationFields, type SelectedDestination } from '../components/marketing/DestinationFields'
import { GraphicPreview, type CanvasStatus } from '../components/marketing/GraphicPreview'
import { WorkspaceShell } from '../components/marketing/WorkspaceShell'
import { useLanguage } from '../context/LanguageContext'
import { findCampaign } from '../data/campaigns'
import { downloadPng } from '../data/canvasGraphics'
import { recordEvent } from '../data/marketingAnalytics'
import { defaultLinkConfig, destinationPath, isLoopback, siteDestinations, validPublicLink } from '../data/marketingTools'
import { drawQrCard } from '../data/qrCanvas'
import { publicCampaignUrl } from '../data/restaurant'
import { toolsCopy } from '../i18n/tools'
import type { Language } from '../types'

export default function QrStudioPage() {
  const { language, t } = useLanguage()
  const { state } = useLocation()
  const [customUrl, setCustomUrl] = useState(() => typeof state?.url === 'string' ? state.url.slice(0, 1200) : '')
  const [destination, setDestination] = useState<SelectedDestination>(() => customUrl ? 'custom' : 'menu')
  const [campaign, setCampaign] = useState(defaultLinkConfig.campaign)
  const [dish, setDish] = useState(defaultLinkConfig.dish)
  const [languageForCard, setLanguageForCard] = useState<Language>(language)
  const [title, setTitle] = useState('')
  const [generated, setGenerated] = useState('')
  const [status, setStatus] = useState<CanvasStatus>('loading')
  const [exportFailed, setExportFailed] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const selected = findCampaign(campaign)
  const url = destination === 'custom' ? validPublicLink(customUrl) : publicCampaignUrl(destinationPath(destination, campaign, dish))
  const localizedTitle = title.trim() || (destination === 'custom' ? toolsCopy.qrCustom[languageForCard] : destination === 'campaign' && selected
    ? selected.name[languageForCard] : siteDestinations[destination].label[languageForCard])
  const scan = toolsCopy.qrCardScan[languageForCard]
  const signature = JSON.stringify([url, localizedTitle, languageForCard])
  const current = status === 'ready' && generated === signature
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!url) return Promise.reject(new Error())
    return drawQrCard(ctx, url, localizedTitle, scan, languageForCard)
  }, [url, localizedTitle, scan, languageForCard])

  function generate() {
    if (!url || status !== 'ready') return
    setGenerated(signature)
    setExportFailed(false)
    void recordEvent('qr_generated', {
      campaignId: destination === 'campaign' ? selected?.id : destination === 'custom' ? findCampaign(state?.campaign)?.id : undefined,
    })
  }

  async function download() {
    if (!canvas.current || !current) return
    try {
      await downloadPng(canvas.current, 'maramia-qr-' + destination + '.png')
    } catch {
      setExportFailed(true)
    }
  }

  return <WorkspaceShell title="qrTitle" intro="qrIntro">
    <div className="workspace-grid">
      <section className="report-panel workspace-controls" aria-labelledby="qr-settings">
        <h2 id="qr-settings">{t('workspaceCustomize')}</h2>
        <div className="workspace-fields">
          <DestinationFields destination={destination} campaign={campaign} dish={dish} custom
            choose={setDestination} setCampaign={setCampaign} setDish={setDish} />
          {destination === 'custom' && <label className="order-field workspace-full">{t('qrCustom')}
            <textarea dir="ltr" rows={3} value={customUrl} maxLength={1200} onChange={(event) => setCustomUrl(event.target.value)} />
          </label>}
          <label className="order-field workspace-full">{t('qrCardTitle')}
            <input dir="auto" value={title} maxLength={62} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="order-field">{t('graphicLanguage')}
            <select value={languageForCard} onChange={(event) => setLanguageForCard(event.target.value as Language)}>
              <option value="ar" lang="ar">العربية</option><option value="en" lang="en">English</option>
            </select>
          </label>
        </div>
      </section>
      <section className={'report-panel workspace-preview-card' + (current ? ' phase8-printed' : '')} aria-labelledby="qr-preview-heading">
        <h2 id="qr-preview-heading">{t('workspacePreview')}</h2>
        {url ? <>
          <div className="graphic-stage graphic-stage-qr">
            <GraphicPreview canvas={canvas} width={920} height={1080} draw={draw} status={status} setStatus={setStatus}
              locale={languageForCard} label={localizedTitle + ' · ' + scan} />
          </div>
          <p className="workspace-url" dir="ltr" data-testid="qr-target">{url}</p>
          {isLoopback(url) && <p className="report-note">{t('workspaceLocalLink')}</p>}
        </> : <p className="report-note">{t('qrInvalid')}</p>}
        <div className="report-actions">
          <button type="button" className="button button--forest" disabled={!url || status !== 'ready' || current} onClick={generate}>{t('qrGenerate')}</button>
          <button type="button" className="button button--line" disabled={!current} onClick={() => void download()}><Download size={16} aria-hidden="true" />{t('workspaceDownload')}</button>
          <button type="button" className="button button--line" disabled={!current} onClick={() => window.print()}><Printer size={16} aria-hidden="true" />{t('qrPrint')}</button>
        </div>
        {current && <p role="status">{t('qrGenerated')}</p>}
        {exportFailed && <p role="alert">{t('workspaceRenderError')}</p>}
      </section>
    </div>
  </WorkspaceShell>
}
