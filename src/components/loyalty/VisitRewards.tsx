import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useOrdering } from '../../context/OrderingContext'
import { membershipTotals, visitPoints } from '../../data/loyalty'
import { dubaiInstant } from '../../data/reservationTime'
import type { CopyKey } from '../../i18n/copy'
import type { Booking } from '../../types/reservation'
import { loyaltyNumber } from './LoyaltySummary'

export function VisitRewards({ booking, now }: { booking: Booking; now: Date }) {
  const { t, language } = useLanguage()
  const { loyalty, completeVisit } = useOrdering()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<CopyKey | null>(null)
  const cancelled = booking.status === 'cancelled'
  const earned = loyalty?.ledger.some((entry) => entry.id === 'visit:' + booking.id)
  const eligible = !cancelled && dubaiInstant(booking.date, booking.time) <= now
  async function complete() {
    setPending(true)
    const result = await completeVisit(booking.id)
    setError(result === 'ok' || result === 'visitAlreadyEarned' ? null : result)
    setPending(false)
  }
  return <section className="booking-panel visit-rewards" aria-labelledby="visit-reward-heading">
    <h2 id="visit-reward-heading">{t('rewardsVisit')}</h2>
    <p>{t('rewardsVisitInfo').replace('{points}', loyaltyNumber(visitPoints, language))}</p>
    {cancelled ? <p>{t('rewardsVisitCancelled')}</p> : earned ? <div aria-live="polite">
      <p data-testid="visit-earned">{t('visitAlreadyEarned')}</p>
      <p>{t('rewardsBalanceLabel').replace('{points}', loyaltyNumber(membershipTotals(loyalty).balance, language))}</p>
      <Link className="button button--line" to="/loyalty">{t('rewardsView')}</Link>
    </div> : <>
      {!eligible && <p>{t('rewardsVisitFuture')}</p>}
      {!loyalty && <Link className="button button--line" to="/loyalty">{t('rewardsJoin')}</Link>}
      {loyalty && <div className="visit-presenter">
        <strong>{t('presenterControl')}</strong>
        <button className="button button--line" type="button" disabled={!eligible || pending} onClick={() => void complete()}>{t('rewardsVisitComplete')}</button>
      </div>}
    </>}
    {error && <p className="booking-error" role="alert">{t(error)}</p>}
  </section>
}
