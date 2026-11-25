import { Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useOrdering } from '../../context/OrderingContext'
import { completedOrderStage, membershipTotals, welcomePoints, type LoyaltyMembership } from '../../data/loyalty'
import type { Language } from '../../types'
import type { DemoOrder } from '../../types/ordering'

export function loyaltyNumber(value: number, language: Language) {
  return value.toLocaleString(language === 'ar' ? 'ar-AE' : 'en-AE')
}

export function TierProgress({ member }: { member: LoyaltyMembership }) {
  const { t, language } = useLanguage()
  const { tier, nextTier, qualifying } = membershipTotals(member)
  return <div className="loyalty-progress">
    <p><strong>{t('rewardsLifetime')}</strong> <bdi data-testid="loyalty-qualifying">{loyaltyNumber(qualifying, language)}</bdi></p>
    {nextTier ? <>
      <progress max={nextTier.threshold - tier.threshold} value={qualifying - tier.threshold} aria-label={t('rewardsTierProgress')} />
      <p>{t('rewardsTierRemaining').replace('{points}', loyaltyNumber(nextTier.threshold - qualifying, language)).replace('{tier}', nextTier.name[language])}</p>
    </> : <p>{t('rewardsTopTier')}</p>}
  </div>
}

export function LoyaltyNotice({ order }: { order?: DemoOrder }) {
  const { t, language } = useLanguage()
  const { loyalty } = useOrdering()
  const points = (value: number) => loyaltyNumber(value, language)
  const { balance } = membershipTotals(loyalty)
  const earned = order && loyalty?.ledger.find(({ id }) => id === 'order:' + order.id)
  const finished = order?.stage === completedOrderStage
  return <aside className="loyalty-notice" aria-label={t('rewardsName')}>
    <Leaf size={18} aria-hidden="true" />
    <div>
      {order && <p data-testid="loyalty-order-message">{earned ? t('rewardsEarned').replace('{points}', points(earned.points))
        : finished ? t('rewardsPastOrder') : t('rewardsPending')}</p>}
      <p>{loyalty ? t('rewardsBalanceLabel').replace('{points}', points(balance))
        : t('rewardsWelcome').replace('{points}', points(welcomePoints))}</p>
      {finished && loyalty && <TierProgress member={loyalty} />}
      <Link to="/loyalty">{t(loyalty ? 'rewardsView' : 'rewardsJoin')}</Link>
    </div>
  </aside>
}
