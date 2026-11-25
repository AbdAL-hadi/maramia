import '../../styles/tools.css'
import { ChartNoAxesCombined, ImagePlus, Link2, ScanLine } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { feedbackFields } from '../../data/customerFeedback'
import type { MarketingMetrics } from '../../data/marketingMetrics'
import { feedbackLabels } from '../../i18n/tools'

const resources = [
  { label: 'studioTitle', path: '/marketing/studio', Icon: ImagePlus },
  { label: 'linksTitle', path: '/marketing/links', Icon: Link2 },
  { label: 'qrTitle', path: '/marketing/qr', Icon: ScanLine },
  { label: 'feedbackAnalytics', path: '#feedback-analytics', Icon: ChartNoAxesCombined },
] as const

export function MarketingToolsDirectory() {
  const { t } = useLanguage()
  return <nav className="report-panel tools-directory" aria-labelledby="marketing-tools-title">
    <h2 id="marketing-tools-title">{t('workspaceTools')}</h2>
    <div className="tools-directory-links">
      {resources.map(({ label, path, Icon }) => path.startsWith('#') ?
        <a href={path} key={path}><Icon aria-hidden="true" size={20} />{t(label)}</a> :
        <Link to={path} key={path}><Icon aria-hidden="true" size={20} />{t(label)}</Link>)}
    </div>
  </nav>
}

export function EngagementReport({ metrics, sample }: { metrics: MarketingMetrics; sample: boolean }) {
  const { language, t } = useLanguage()
  const locale = language === 'ar' ? 'ar-AE' : 'en-AE'
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 })
  const format = (value: number | null) => value === null ? '—' : number.format(value)
  const activity = [
    ['toolsGraphicsCount', metrics.tools.graphics], ['toolsLinksCount', metrics.tools.links],
    ['toolsQrCount', metrics.tools.qr], ['toolsGiftPreviewCount', metrics.tools.giftPreviews], ['toolsGiftCount', metrics.tools.gifts],
  ] as const
  return <>
    <section className="report-panel engagement-panel" aria-labelledby="tools-activity-title">
      <h2 id="tools-activity-title">{t('toolsActivity')}</h2>
      <p className="report-note">{t('toolsActivityNote')}</p>
      <dl className="report-kpis">{activity.map(([key, value]) => <div key={key} className="report-kpi" data-metric={key}>
        <dt>{t(key)}</dt><dd><bdi>{format(value)}</bdi></dd>
      </div>)}</dl>
    </section>
    <section className="report-panel engagement-panel" id="feedback-analytics" tabIndex={-1} aria-labelledby="feedback-analytics-title">
      <h2 id="feedback-analytics-title">{t('feedbackAnalytics')}</h2>
      <p className="engagement-dataset">{t(sample ? 'marketingSample' : 'marketingLocal')}</p>
      <p className="report-note">{t('feedbackMetricsNote')}</p>
      <dl className="feedback-kpis">
        <div className="report-kpi" data-metric="feedbackResponses"><dt>{t('feedbackResponses')}</dt><dd><bdi>{format(metrics.feedback.count)}</bdi></dd></div>
        {feedbackFields.map((field) => {
          const { count, average } = metrics.feedback.ratings[field]
          return <div className="report-kpi" key={field} data-metric={'feedback-' + field}>
            <dt>{field === 'recommendation' ? t('feedbackRecommendation') : feedbackLabels[field][language]}</dt>
            <dd><bdi>{format(average)}{average !== null && (field === 'recommendation' ? ' / 10' : ' / 5')}</bdi></dd>
            <dd className="report-kpi-detail">{t('feedbackAnswerCount').replace('{count}', format(count))}</dd>
          </div>
        })}
        <div className="report-kpi" data-metric="feedback-nps">
          <dt>{t('feedbackNps')}</dt><dd><bdi>{format(metrics.feedback.nps)}</bdi></dd>
          <dd className="report-kpi-detail">{t('feedbackAnswerCount').replace('{count}', format(metrics.feedback.ratings.recommendation.count))}</dd>
        </div>
      </dl>
      <Link className="button button--line" to="/feedback">{t('feedbackTitle')}</Link>
    </section>
  </>
}
