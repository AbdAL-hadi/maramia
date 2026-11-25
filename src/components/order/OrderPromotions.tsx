import { Tag } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { aedCurrency } from '../../data/menuFilters'
import { featuredPromotion, freeDelivery, promotions } from '../../data/ordering'
import { getPromotion } from '../../data/orderMath'

export function PromoBanner() {
  const { language, t } = useLanguage()
  const promotion = promotions[featuredPromotion]
  if (!promotion?.active) return null
  const value = promotion.kind === 'percent' ? String(promotion.value) : aedCurrency[language].format(promotion.value / 100)
  return (
    <aside className="order-promo-banner">
      <Tag size={17} aria-hidden="true" />
      <p>{t(promotion.kind === 'percent' ? 'promoBannerPercent' : 'promoBannerFixed').replace('{value}', value)} <bdi>{featuredPromotion}</bdi></p>
    </aside>
  )
}

export function PromoField({ subtotal, code, setCode, suggested }: {
  subtotal: number
  code: string
  setCode: (code: string) => void
  suggested?: string
}) {
  const { language, t } = useLanguage()
  const [input, setInput] = useState('')
  const [attempted, setAttempted] = useState<string | null>(null)
  const result = attempted === null ? null : getPromotion(attempted, subtotal)
  const active = code || suggested ? getPromotion(code || suggested || '', subtotal) : null
  const minimum = (value: number) => t('promoMinimum').replace('{amount}', aedCurrency[language].format(value / 100))

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = input.trim().toUpperCase()
    setAttempted(next)
    const promotion = getPromotion(next, subtotal)
    if (promotion.status === 'applied') setCode(promotion.code)
  }

  return (
    <div className="promo-field">
      <form onSubmit={apply}>
        <label className="order-field">
          <span>{t('promo')}</span>
          <input value={input} dir="ltr" maxLength={25} onChange={(event) => { setInput(event.target.value); setAttempted(null) }} />
        </label>
        <button className="button button--line" type="submit">{t('applyPromo')}</button>
      </form>
      {code && (
        <div className="promo-active">
          <bdi>{code}</bdi>
          <button className="cart-text-button" type="button" onClick={() => { setCode(''); setAttempted(null); setInput('') }}>{t('removePromo')}</button>
        </div>
      )}
      <p className="promo-feedback" role="status">
        {result?.status === 'applied' && attempted === code && t('promoApplied')}
        {result?.status === 'invalid' && t('promoInvalid')}
        {result?.status === 'minimum' && minimum(result.minimum)}
        {!result && active?.status === 'minimum' && minimum(active.minimum)}
        {!result && code && active?.status === 'invalid' && t('promoInvalid')}
        {!result && code && suggested === code && active?.status === 'applied' && t('automaticPromo')}
      </p>
    </div>
  )
}

export function FreeDeliveryProgress({ subtotal }: { subtotal: number }) {
  const { language, t } = useLanguage()
  const threshold = freeDelivery.threshold
  if (!freeDelivery.enabled || threshold <= 0) return null
  const remaining = Math.max(0, threshold - subtotal)
  const amount = aedCurrency[language].format(remaining / 100)
  return (
    <div className="free-delivery">
      <p>{remaining ? t('freeDeliveryRemaining').replace('{amount}', amount) : t('freeDeliveryEarned')}</p>
      <progress aria-label={t('freeDeliveryProgress')} value={Math.min(subtotal, threshold)} max={threshold} />
    </div>
  )
}
