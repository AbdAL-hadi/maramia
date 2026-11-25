import { useLanguage } from '../../context/LanguageContext'
import { membershipTotals, rewardById, type LoyaltyMembership } from '../../data/loyalty'
import type { MarketingMetrics } from '../../data/marketingMetrics'
import type { CopyKey } from '../../i18n/copy'
import { metricFormats } from '../marketing/MarketingCharts'

export function RetentionReport({ member, sample, retention }: {
  member: LoyaltyMembership | undefined
  sample: boolean
  retention: MarketingMetrics['retention']
}) {
  const { language, t } = useLanguage()
  const format = metricFormats(language)
  const lifetime = membershipTotals(member)
  const metrics: readonly [CopyKey, number, 'count' | 'rate' | 'currency'][] = [
    ['retentionEligibleOrders', retention.eligibleOrders, 'count'],
    ['retentionRepeatRate', retention.repeatRate, 'rate'],
    ['retentionEligibleAverage', retention.average, 'currency'],
    ['retentionRepeatRevenue', retention.repeatRevenue, 'currency'],
    ['retentionRedemptions', retention.redemptions, 'count'],
    ['retentionRedeemedPoints', retention.pointsRedeemed, 'count'],
  ]
  return <section className="report-panel retention-panel" aria-labelledby="retention-title">
    <h2 id="retention-title">{t('retentionTitle')}</h2>
    <h3>{t('retentionSnapshot')}</h3>
    <p data-testid="retention-membership">{member
      ? t(sample ? 'rewardsSampleOnly' : 'rewardsMember') + ' · ' + lifetime.tier.name[language] : t('rewardsNonMember')}</p>
    <p><strong>{t('rewardsLifetime')}</strong> <bdi data-testid="retention-qualifying">{format.count(lifetime.qualifying)}</bdi></p>
    <h3>{t('retentionFiltered')}</h3>
    <p className="report-note">{t('retentionDefinition')}</p>
    <dl className="report-kpis">{metrics.map(([label, value, kind]) => <div className="report-kpi" key={label} data-metric={label}>
      <dt>{t(label)}</dt><dd><bdi>{format[kind](value)}</bdi></dd>
    </div>)}</dl>
    <h3>{t('retentionRewardDistribution')}</h3>
    {retention.distribution.length ? <ul className="retention-distribution" role="list">
      {retention.distribution.map(([id, count]) => <li key={id}><span>{rewardById(id)?.name[language]}</span><bdi>{format.count(count)}</bdi></li>)}
    </ul> : <p className="report-note">{t('retentionNoRedemptions')}</p>}
  </section>
}
