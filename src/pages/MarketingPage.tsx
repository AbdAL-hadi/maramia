import { Download, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { LanguageSwitch } from '../components/LanguageSwitch'
import { MarketingCharts, metricCards, metricFormats } from '../components/marketing/MarketingCharts'
import { EngagementReport, MarketingToolsDirectory } from '../components/marketing/EngagementReport'
import { RetentionReport } from '../components/loyalty/RetentionReport'
import { useLanguage } from '../context/LanguageContext'
import { useOrdering } from '../context/OrderingContext'
import { campaignPath, campaigns, findCampaign, referralPath } from '../data/campaigns'
import { analyticsChanged, analyticsKey, readAnalytics, resetAnalytics, sources, type AcquisitionSource } from '../data/marketingAnalytics'
import { downloadAggregateCsv } from '../data/marketingExport'
import { defaultMarketingFilters, marketingMetrics, sampleMarketingEvents } from '../data/marketingMetrics'
import { loadBookings, reservationStorageKey } from '../data/reservationStorage'
import { sampleMembership } from '../data/loyaltySamples'
import { dubaiInstant } from '../data/reservationTime'
import { useModalFocus } from '../hooks/useModalFocus'
import type { CopyKey } from '../i18n/copy'
import { acquisitionCopy } from '../i18n/marketing'

function readLocalReport() {
  return {
    events: readAnalytics(),
    cancelled: new Set(loadBookings().filter(({ status }) => status === 'cancelled').map(({ id }) => id)),
  }
}

function ResetDialog({ close, confirm }: { close: () => void; confirm: () => Promise<void> }) {
  const { t } = useLanguage()
  const dialog = useRef<HTMLDialogElement>(null)
  const cancel = useRef<HTMLButtonElement>(null)
  const [pending, setPending] = useState(false)
  useModalFocus(dialog, cancel)
  return <dialog className="marketing-reset-dialog" ref={dialog} aria-labelledby="marketing-reset-title"
    onCancel={(event) => { event.preventDefault(); if (!pending) close() }}>
    <div>
      <h2 id="marketing-reset-title">{t('marketingReset')}</h2>
      <p>{t('marketingResetBody')}</p>
      <div className="report-actions">
        <button className="button button--line" type="button" ref={cancel} onClick={close} disabled={pending}>{t('marketingDismiss')}</button>
        <button className="button button--forest" type="button" disabled={pending} onClick={() => {
          setPending(true)
          void confirm()
        }}>{t('marketingResetConfirm')}</button>
      </div>
    </div>
  </dialog>
}

function Walkthrough() {
  const { t } = useLanguage()
  const family = findCampaign('family')
  return <section className="report-panel marketing-walkthrough" aria-labelledby="marketing-demo-title">
    <h2 id="marketing-demo-title">{t('marketingWalkthrough')}</h2>
    <ol>
      <li><Link to={referralPath('MIRA10')}>{t('marketingDemoVisit')}</Link></li>
      <li>{t('marketingDemoOrder')}</li>
      <li>{family && <Link to={campaignPath(family)}>{t('marketingDemoReserve')}</Link>}</li>
      <li>{t('marketingDemoResults')}</li>
    </ol>
    <p>{t('marketingDemoSample')}</p>
  </section>
}

export default function MarketingPage() {
  const { t, language } = useLanguage()
  const { loyalty } = useOrdering()
  const [defaults] = useState(defaultMarketingFilters)
  const [filters, setFilters] = useState(defaults)
  const [dataset, setDataset] = useState<'local' | 'sample'>('local')
  const [local, setLocal] = useState(readLocalReport)
  const [notice, setNotice] = useState<CopyKey | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const sample = useMemo(() => sampleMarketingEvents(defaults.to), [defaults.to])
  const invalidRange = Boolean(filters.from && filters.to && filters.from > filters.to)
  const metrics = useMemo(() => marketingMetrics(
    dataset === 'sample' ? sample : local.events, filters, dataset === 'sample' ? new Set() : local.cancelled,
  ), [dataset, sample, local, filters])
  const formats = metricFormats(language)

  useLayoutEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [])
  useEffect(() => {
    const sync = () => setLocal(readLocalReport())
    const onStorage = (event: StorageEvent) => {
      if (event.key === analyticsKey || event.key === reservationStorageKey || event.key === null) sync()
    }
    window.addEventListener(analyticsChanged, sync)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(analyticsChanged, sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  async function confirmReset() {
    const saved = await resetAnalytics()
    setResetOpen(false)
    setNotice(saved ? 'marketingResetSuccess' : 'storageError')
    if (saved) {
      setLocal(readLocalReport())
      setDataset('local')
    }
  }

  return <div className="marketing-dashboard">
    <a className="skip-link" href="#marketing-main">{t('skip')}</a>
    <header className="marketing-top">
      <div className="container"><Brand /><div>
        <Link to="/offers">{t('offers')}</Link>
        <LanguageSwitch />
      </div></div>
    </header>
    <main id="marketing-main" className="container marketing-main" tabIndex={-1}>
      <div className="marketing-heading">
        <p className="eyebrow">{t('marketingDemo')}</p>
        <h1>{t('marketingTitle')}</h1>
        <p>{t('marketingIntro')}</p>
      </div>
      <MarketingToolsDirectory />
      <section className="report-panel marketing-controls" aria-labelledby="marketing-controls-title">
        <h2 id="marketing-controls-title">{t('marketingFilters')}</h2>
        <div className="report-fields">
          <label>{t('marketingFrom')}<input type="date" value={filters.from} dir="ltr" onChange={(event) => setFilters({ ...filters, from: event.target.value })} /></label>
          <label>{t('marketingTo')}<input type="date" value={filters.to} dir="ltr" onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></label>
          <label>{t('marketingCampaign')}<select value={filters.campaignId} onChange={(event) => setFilters({ ...filters, campaignId: event.target.value })}>
            <option value="">{t('marketingAll')}</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name[language]}</option>)}
          </select></label>
          <label>{t('marketingSource')}<select value={filters.source} onChange={(event) => setFilters({ ...filters, source: event.target.value as AcquisitionSource | '' })}>
            <option value="">{t('marketingAll')}</option>{sources.map((source) => <option key={source} value={source}>{acquisitionCopy[source][language]}</option>)}
          </select></label>
          <label>{t('marketingDataset')}<select value={dataset} onChange={(event) => setDataset(event.target.value === 'sample' ? 'sample' : 'local')}>
            <option value="local">{t('marketingLocal')}</option><option value="sample">{t('marketingSample')}</option>
          </select></label>
        </div>
        <div className="report-actions">
          <button type="button" className="button button--line" onClick={() => {
            setLocal(readLocalReport())
            setNotice('marketingRefreshed')
          }}><RefreshCw size={17} aria-hidden="true" />{t('marketingRefresh')}</button>
          <button type="button" className="button button--forest" disabled={invalidRange} onClick={() => downloadAggregateCsv(metrics, filters, dataset)}>
            <Download size={17} aria-hidden="true" />{t('marketingExport')}
          </button>
          <button type="button" className="button button--line" onClick={() => { setNotice(null); setResetOpen(true) }}>
            <Trash2 size={17} aria-hidden="true" />{t('marketingReset')}
          </button>
        </div>
        {notice && <p role="status">{t(notice)}</p>}
      </section>
      {dataset === 'sample' && <p role="status" className="report-sample">{t('marketingSampleNote')}</p>}
      {invalidRange ? <p role="alert" className="report-empty">{t('marketingInvalidRange')}</p> : <>
        {metrics.eventCount === 0 && <p role="status" className="report-empty">{t('marketingEmpty')}</p>}
        <dl className="report-kpis">
          {metricCards(metrics).map(([label, value, kind, detail]) => <div className="report-kpi" key={label} data-metric={label}>
            <dt>{t(label)}</dt><dd><bdi>{formats[kind](value)}</bdi></dd>
            {detail && <dd className="report-kpi-detail">{t(detail)}</dd>}
          </div>)}
        </dl>
        <MarketingCharts metrics={metrics} />
        <RetentionReport member={dataset === 'sample' ? sampleMembership('olive', dubaiInstant(defaults.to, 720).getTime()) : loyalty}
          sample={dataset === 'sample'} retention={metrics.retention} />
        <EngagementReport metrics={metrics} sample={dataset === 'sample'} />
      </>}
      <Walkthrough />
    </main>
    {resetOpen && <ResetDialog close={() => setResetOpen(false)} confirm={confirmReset} />}
  </div>
}
