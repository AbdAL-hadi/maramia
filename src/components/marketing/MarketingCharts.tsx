import type { ReactNode } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import type { MarketingMetrics } from '../../data/marketingMetrics'
import { quizOption } from '../../data/marketingPreferences'
import { menuCatalog } from '../../data/menu'
import { aedCurrency } from '../../data/menuFilters'
import { dateLabel } from '../../data/reservationTime'
import type { CopyKey } from '../../i18n/copy'
import { acquisitionCopy, preferenceHeadings } from '../../i18n/marketing'
import type { Language } from '../../types'

const funnelLabels = ['marketingFunnelVisit', 'marketingFunnelMenu', 'marketingFunnelCart', 'marketingFunnelCheckout', 'marketingFunnelOrder'] as const

export function dishLabel(id: string, language: Language) {
  const item = menuCatalog.find((dish) => dish.id === id)
  return (language === 'ar' ? item?.nameAr : item?.nameEn) ?? id
}

export function metricCards(metrics: MarketingMetrics): readonly [CopyKey, number, 'count' | 'currency' | 'rate', CopyKey?][] {
  return [
    ['marketingSessions', metrics.sessions, 'count'], ['marketingVisits', metrics.campaignVisits, 'count'],
    ['marketingOrders', metrics.orders, 'count'], ['marketingReservations', metrics.reservations, 'count'],
    ['marketingRevenue', metrics.revenue, 'currency'], ['marketingAverage', metrics.average, 'currency'],
    ['marketingOrderRate', metrics.orderRate, 'rate', 'marketingOrderDenominator'],
    ['marketingReservationRate', metrics.reservationRate, 'rate', 'marketingReservationDenominator'],
    ['marketingRedemptions', metrics.redemptions, 'count'],
    ['marketingQuizRate', metrics.quizRate, 'rate', 'marketingQuizDenominator'],
  ]
}

export function metricFormats(language: Language) {
  const locale = language === 'ar' ? 'ar-AE' : 'en-AE'
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 })
  return {
    count: (value: number) => value.toLocaleString(locale),
    currency: (value: number) => aedCurrency[language].format(value / 100),
    rate: (value: number) => percent.format(value),
  }
}

type Bar = { label: string; value: number }

function BarList({ rows, format, ordered = false }: { rows: readonly Bar[]; format: (value: number) => string; ordered?: boolean }) {
  const List = ordered ? 'ol' : 'ul'
  const max = Math.max(1, ...rows.map(({ value }) => value))
  return <List className="report-bars" role="list">
    {rows.map(({ label, value }) => <li key={label}>
      <div><span>{label}</span><bdi>{format(value)}</bdi></div>
      <span className="report-bar-track" aria-hidden="true"><span style={{ inlineSize: (100 * value / max) + '%' }} /></span>
    </li>)}
  </List>
}

function ReportPanel({ title, note, wide, children }: { title: CopyKey; note?: CopyKey; wide?: boolean; children: ReactNode }) {
  const { t } = useLanguage()
  return <section className={'report-panel' + (wide ? ' report-panel-wide' : '')} aria-labelledby={title + '-title'}>
    <h2 id={title + '-title'}>{t(title)}</h2>
    {note && <p className="report-note">{t(note)}</p>}
    {children}
  </section>
}

export function MarketingCharts({ metrics }: { metrics: MarketingMetrics }) {
  const { t, language } = useLanguage()
  const format = metricFormats(language)
  const empty = <p className="report-empty">{t('marketingEmpty')}</p>
  const tableHeads = ['marketingCampaign', 'marketingVisits', 'marketingOrders', 'marketingReservations', 'marketingOrderRate', 'marketingReservationRate', 'marketingRevenue'] as const
  return <div className="report-panels">
    <ReportPanel title="marketingFunnel" note="marketingFunnelDetail">
      <BarList rows={metrics.funnel.map((value, index) => ({ label: t(funnelLabels[index]), value }))} format={format.count} ordered />
    </ReportPanel>
    <ReportPanel title="marketingAcquisition" note="marketingAcquisitionNote">
      <BarList rows={metrics.acquisition.map(({ source, visits }) => ({ label: acquisitionCopy[source][language], value: visits }))} format={format.count} />
      {metrics.referralRows.length > 0 && <div className="report-referrals">
        <h3>{t('campaignReferralTitle')}</h3>
        <ul role="list">{metrics.referralRows.map(({ code, visits, orders, reservations }) => <li key={code}>
          <strong><bdi>{code}</bdi></strong>
          <span>{t('marketingReferralSummary')
            .replace('{visits}', format.count(visits))
            .replace('{orders}', format.count(orders))
            .replace('{reservations}', format.count(reservations))}</span>
        </li>)}</ul>
      </div>}
    </ReportPanel>

    <ReportPanel title="marketingPerformance" note="marketingPerformanceNote" wide>
      <div className="report-scroll" tabIndex={0} role="region" aria-labelledby="marketingPerformance-title">
        <table className="report-table">
          <thead><tr>{tableHeads.map((key) => <th key={key} scope="col">{t(key)}</th>)}</tr></thead>
          <tbody>{metrics.campaignRows.map((row) => <tr key={row.campaign.id} data-campaign-row={row.campaign.id}>
            <th scope="row">{row.campaign.name[language]}</th>
            <td><bdi>{format.count(row.visits)}</bdi></td><td><bdi>{format.count(row.orders)}</bdi></td>
            <td><bdi>{format.count(row.reservations)}</bdi></td><td><bdi>{format.rate(row.orderRate)}</bdi></td>
            <td><bdi>{format.rate(row.reservationRate)}</bdi></td><td><bdi>{format.currency(row.revenue)}</bdi></td>
          </tr>)}</tbody>
        </table>
      </div>
    </ReportPanel>

    <ReportPanel title="marketingPopular" wide>
      <div className="report-split">
        <div><h3>{t('marketingViewed')}</h3>{metrics.viewed.length
          ? <BarList rows={metrics.viewed.slice(0, 5).map(([id, value]) => ({ label: dishLabel(id, language), value }))} format={format.count} /> : empty}</div>
        <div><h3>{t('marketingOrdered')}</h3>{metrics.ordered.length
          ? <BarList rows={metrics.ordered.slice(0, 5).map(([id, value]) => ({ label: dishLabel(id, language), value }))} format={format.count} /> : empty}</div>
      </div>
    </ReportPanel>
    <ReportPanel title="marketingPreferences" note="marketingPreferencesNote" wide>
      {metrics.preferences.some(({ counts }) => counts.length) ? <div className="report-preferences">
        {metrics.preferences.map(({ field, counts }) => <div key={field}>
          <h3>{preferenceHeadings[field][language]}</h3>
          <BarList rows={counts.map(([id, value]) => ({ label: quizOption(field, id)?.label[language] ?? id, value }))} format={format.count} />
        </div>)}
      </div> : empty}
    </ReportPanel>
    <ReportPanel title="marketingDaily" note="marketingDailyNote" wide>
      {metrics.daily.length ? <BarList rows={metrics.daily.map(([date, value]) => ({
        label: dateLabel(date, language, { dateStyle: 'medium' }), value,
      }))} format={format.currency} /> : empty}
    </ReportPanel>
  </div>
}
