import { Link } from 'react-router-dom'
import { SageSprig } from '../components/Brand'
import { loyaltyNumber } from '../components/loyalty/LoyaltySummary'
import { useLanguage } from '../context/LanguageContext'
import { useOrdering } from '../context/OrderingContext'
import { membershipTotals, welcomePoints } from '../data/loyalty'

export function HomeRewards() {
  const { t, language } = useLanguage()
  const { loyalty } = useOrdering()
  const { balance } = membershipTotals(loyalty)
  return <section className="home-rewards" aria-labelledby="home-rewards-title">
    <div className="container">
      <SageSprig className="home-rewards-sprig" />
      <div>
        <h2 id="home-rewards-title">{t('rewardsName')}</h2>
        <p>{t(loyalty ? 'rewardsBalanceLabel' : 'rewardsWelcome').replace('{points}', loyaltyNumber(loyalty ? balance : welcomePoints, language))}</p>
      </div>
      <div className="editorial-actions">
        <Link className="button button--gold" to="/loyalty">{t('rewardsView')}</Link>
        <Link className="button button--outline" to="/gift-cards">{t('giftTitle')}</Link>
      </div>
    </div>
  </section>
}
