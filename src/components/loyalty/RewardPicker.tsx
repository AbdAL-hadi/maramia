import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { membershipTotals, rewardById, rewards, type LoyaltyMembership, type RewardAccess } from '../../data/loyalty'
import { quoteReward } from '../../data/orderMath'
import type { CopyKey } from '../../i18n/copy'
import type { CartLine } from '../../types/ordering'
import { Money } from '../order/OrderAmounts'
import { loyaltyNumber } from './LoyaltySummary'

export const rewardStatusCopy: Record<RewardAccess, CopyKey> = {
  eligible: 'rewardEligible', unavailable: 'rewardUnavailable', join: 'rewardJoin',
  tier: 'rewardTier', points: 'rewardPoints', minimum: 'rewardMinimum', item: 'rewardItemMissing',
}

export function RewardPicker({ member, cart, subtotal, selected, setSelected, code, codeSaving, useCode }: {
  member?: LoyaltyMembership
  cart: CartLine[]
  subtotal: number
  selected: string
  setSelected: (value: string) => void
  code: string
  codeSaving: number
  useCode: (code: string) => void
}) {
  const { language, t } = useLanguage()
  const active = rewardById(selected)
  const quote = quoteReward(active, member, cart, subtotal)
  const number = (value: number) => loyaltyNumber(value, language)
  return <section className="checkout-rewards" aria-label={t('rewardsName')}>
    {member ? <>
      <p>{t('rewardsBalanceLabel').replace('{points}', number(membershipTotals(member).balance))}</p>
      <label className="order-field">
        <span>{t('rewardChoice')}</span>
        <select value={active?.id ?? ''} onChange={(event) => setSelected(event.target.value)}>
          <option value="">{t('rewardNone')}</option>
          {rewards.filter((reward) => reward.active || reward.id === selected).map((reward) => {
            const option = quoteReward(reward, member, cart, subtotal)
            return <option value={reward.id} key={reward.id}>
              {reward.name[language]} {' · '} {t('rewardsPointCount').replace('{points}', number(reward.points))}
              {option.status !== 'eligible' ? ' · ' + t(rewardStatusCopy[option.status]) : ''}
            </option>
          })}
        </select>
      </label>
    </> : <Link to="/loyalty">{t('rewardsJoin')}</Link>}
    <p className="checkout-reward-rule">{t('rewardConflict')}</p>
    {selected && <div className="checkout-reward-selection">
      <p role="status">{quote.status === 'eligible' && active
        ? t('rewardReserved').replace('{points}', number(active.points)) : t(rewardStatusCopy[quote.status])}</p>
      {quote.discount > 0 && <p><strong>{t('rewardUsed')}</strong> <Money fils={-quote.discount} /></p>}
      <div className="order-actions">
        <button className="button button--line" type="button" onClick={() => setSelected('')}>{t('rewardRemove')}</button>
        {code && codeSaving > 0 && <button type="button" className="button button--line" onClick={() => useCode(code)}>
          {t('rewardUsePromo').replace('{code}', code)} <Money fils={-codeSaving} />
        </button>}
      </div>
    </div>}
  </section>
}
