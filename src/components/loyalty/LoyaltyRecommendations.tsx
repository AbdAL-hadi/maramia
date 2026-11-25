import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useOrdering } from '../../context/OrderingContext'
import { campaignPath } from '../../data/campaigns'
import type { LoyaltyMembership, LoyaltyPreferences } from '../../data/loyalty'
import { recommendedForMember, reorderSelection } from '../../data/loyaltyRecommendations'
import { cleanLoyaltyPreferences } from '../../data/loyaltyStorage'
import { readAnalytics } from '../../data/marketingAnalytics'
import { quizOptions } from '../../data/marketingPreferences'
import { dishLink } from '../../data/menuFilters'
import { calculateSubtotal, resolveDish } from '../../data/orderMath'
import type { CopyKey } from '../../i18n/copy'
import type { DishSelection } from '../../types/menu'
import type { DemoOrder } from '../../types/ordering'
import { DishMedia } from '../menu/DishMedia'
import { Money } from '../order/OrderAmounts'

function PreferencesForm({ preferences }: { preferences: LoyaltyPreferences }) {
  const { t, language } = useLanguage()
  const { saveLoyaltyPreferences } = useOrdering()
  const [notice, setNotice] = useState<CopyKey | null>(null)
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const value = cleanLoyaltyPreferences({ food: data.get('food'), atmosphere: data.get('atmosphere') })
    setNotice(await saveLoyaltyPreferences(value) ? 'rewardsPreferencesSaved' : 'storageError')
  }
  return <form className="loyalty-preferences" onSubmit={save}>
    <h3>{t('rewardsPreferences')}</h3>
    <p>{t('rewardsPreferencesText')}</p>
    <label className="order-field"><span>{t('signupFood')}</span>
      <select name="food" defaultValue={preferences.food ?? ''}>
        <option value="">{t('signupOptional')}</option>
        {quizOptions.food.map(({ id, label }) => <option key={id} value={id}>{label[language]}</option>)}
      </select>
    </label>
    <label className="order-field"><span>{t('recommendedSeating')}</span>
      <select name="atmosphere" defaultValue={preferences.atmosphere ?? ''}>
        <option value="">{t('signupOptional')}</option>
        {quizOptions.atmosphere.map(({ id, label }) => <option key={id} value={id}>{label[language]}</option>)}
      </select>
    </label>
    <button type="submit" className="button button--line">{t('saveChanges')}</button>
    {notice && <p role="status">{t(notice)}</p>}
  </form>
}

function Reorder({ order }: { order: DemoOrder }) {
  const { language, t } = useLanguage()
  const { addMany } = useOrdering()
  const lines = order.items.flatMap((line) => reorderSelection(line) ?? [])
  const [excluded, setExcluded] = useState<Set<number>>(() => new Set())
  const [message, setMessage] = useState<CopyKey | null>(null)
  const [pending, setPending] = useState(false)
  const selected: DishSelection[] = lines.filter((_, index) => !excluded.has(index))
  async function addSelections() {
    setPending(true)
    const result = await addMany(selected)
    setMessage(result === 'ok' ? 'quizAdded' : result === 'limit' ? 'quizCartLimit' : 'unavailableDish')
    setPending(false)
  }
  return <details className="loyalty-reorder">
    <summary>{t('rewardsReorderReview').replace('{reference}', order.id)}</summary>
    {lines.length < order.items.length && <p>{t('rewardsReorderUnavailable')}</p>}
    {lines.length > 0 && <>
      <ul role="list">{lines.map((line, index) => {
        const dish = resolveDish(line)
        if (!dish) return null
        return <li key={index}><label>
          <input type="checkbox" checked={!excluded.has(index)} onChange={(event) => {
            const keep = event.target.checked
            setExcluded((previous) => {
              const next = new Set(previous)
              if (keep) next.delete(index)
              else next.add(index)
              return next
            })
            setMessage(null)
          }} />
          <span><bdi>{line.quantity} ×</bdi> {language === 'ar' ? dish.item.nameAr : dish.item.nameEn}
            {dish.variant && <small>{dish.variant.name[language]}</small>}</span>
          <Money fils={dish.unitPrice * line.quantity} />
        </label></li>
      })}</ul>
      <p><strong>{t('subtotal')}</strong> <Money fils={calculateSubtotal(selected)} /></p>
      <div className="editorial-actions">
        <button className="button button--forest" type="button" disabled={!selected.length || pending || message === 'quizAdded'} onClick={() => void addSelections()}>{t('quizAdd')}</button>
        {message === 'quizAdded' && <Link className="button button--line" to="/order">{t('checkout')}</Link>}
      </div>
      {message && <p role="status">{t(message)}</p>}
    </>}
  </details>
}

export function LoyaltyRecommendations({ member, sample }: { member?: LoyaltyMembership; sample: boolean }) {
  const { language, t } = useLanguage()
  const { orders } = useOrdering()
  const [quiz] = useState(() => readAnalytics().reverse().find(({ type }) => type === 'quiz_complete')?.preferences)
  const preferences = { ...(!sample && quiz ? { food: quiz.food, atmosphere: quiz.atmosphere } : {}), ...member?.preferences }
  const { items, campaign, completed } = recommendedForMember(sample ? [] : orders, preferences)
  return <section className="editorial-section loyalty-recommendations" aria-labelledby="loyalty-recommendations-title">
    <div className="container">
      <div className="loyalty-recommendations-body">
        <div>
          <h2 id="loyalty-recommendations-title">{t('rewardsRecommended')}</h2>
          <p>{t(preferences.food || preferences.atmosphere ? 'rewardsBasedOnQuiz' : completed.length ? 'rewardsBasedOnOrders' : 'rewardsBasedOnMenu')}</p>
          <ul className="loyalty-dish-list" role="list">{items.map((dish) => <li key={dish.id}>
            {sample ? <>
              <DishMedia item={dish} className="loyalty-dish-photo" />
              <span>{language === 'ar' ? dish.nameAr : dish.nameEn}</span>
            </> : <Link to={dishLink(dish.slug)}>
              <DishMedia item={dish} className="loyalty-dish-photo" />
              <span>{language === 'ar' ? dish.nameAr : dish.nameEn}</span>
            </Link>}
          </li>)}</ul>
          {member && campaign && <p className="loyalty-campaign">
            {t('rewardsCampaign')} · {sample ? campaign.name[language] : <Link to={campaignPath(campaign)}>{campaign.name[language]}</Link>}
          </p>}
        </div>
        {member && !sample && <PreferencesForm preferences={member.preferences} />}
      </div>
      {!sample && <div className="loyalty-reorder-section">
        <h3>{t('rewardsReorder')}</h3><p>{t('rewardsReorderNote')}</p>
        {completed.length ? completed.slice(0, 3).map((order) => <Reorder order={order} key={order.id} />) : <p>{t('rewardsReorderEmpty')}</p>}
      </div>}
    </div>
  </section>
}
