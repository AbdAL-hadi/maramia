import { ShoppingBag } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loyaltyNumber } from '../components/loyalty/LoyaltySummary'
import { RewardPicker } from '../components/loyalty/RewardPicker'
import { CartLines } from '../components/order/CartLines'
import { CheckoutForm, checkoutFormId } from '../components/order/CheckoutForm'
import { OrderAmounts } from '../components/order/OrderAmounts'
import { OrderHero } from '../components/order/OrderHero'
import { FreeDeliveryProgress, PromoBanner, PromoField } from '../components/order/OrderPromotions'
import { OrderRecommendations } from '../components/order/OrderRecommendations'
import { useLanguage } from '../context/LanguageContext'
import { useOrdering } from '../context/OrderingContext'
import { validateCheckout, type CheckoutErrors } from '../data/checkoutValidation'
import { calculateAmounts, getPromotion, quoteReward } from '../data/orderMath'
import { earnsPoints, membershipTotals, rewardById } from '../data/loyalty'
import { recordEvent, suggestedPromotion } from '../data/marketingAnalytics'
import type { CopyKey } from '../i18n/copy'
import type { Fulfillment, FulfillmentMode, PaymentMethod } from '../types/ordering'

export function OrderPage() {
  const { language, t } = useLanguage()
  const { cart, orders, subtotal, clear, createOrder, loyalty } = useOrdering()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [mode, setMode] = useState<FulfillmentMode>('delivery')
  const [emirate, setEmirate] = useState('')
  const [slot, setSlot] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('cash')
  const [manualCode, setCode] = useState<string | null>(null)
  const [selectedReward, setSelectedReward] = useState(() => params.get('reward') ?? '')
  const [candidate, setCandidate] = useState(suggestedPromotion)
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [notice, setNotice] = useState<CopyKey | null>(null)
  const submitting = useRef(false)
  const fulfillment: Fulfillment = mode === 'delivery' ? { mode, emirate } : { mode, slot }
  const candidateStatus = getPromotion(candidate, subtotal)
  const availableCode = manualCode ?? (candidateStatus.status === 'applied' ? candidate : '')
  const code = selectedReward ? '' : availableCode
  const quote = quoteReward(rewardById(selectedReward), loyalty, cart, subtotal)
  const amounts = calculateAmounts(subtotal, fulfillment, code, quote.discount)
  const latest = orders[0]
  const started = useRef(false)
  const lastReward = useRef('')
  const hasCart = cart.length > 0
  useEffect(() => {
    setCandidate(suggestedPromotion())
    const requested = params.get('reward')
    if (requested) setSelectedReward(requested)
  }, [params])
  useEffect(() => {
    if (hasCart && !started.current) {
      started.current = true
      void recordEvent('checkout_start')
    }
  }, [hasCart])
  useEffect(() => {
    const active = quote.status === 'eligible' ? selectedReward : ''
    if (active && lastReward.current !== active) void recordEvent('loyalty_reward_selected', { rewardId: active })
    lastReward.current = active
  }, [quote.status, selectedReward])

  function chooseReward(id: string) {
    setSelectedReward(id)
    setNotice(null)
    if (params.has('reward')) {
      const next = new URLSearchParams(params)
      next.delete('reward')
      setParams(next, { replace: true })
    }
  }

  function choosePromo(code: string) {
    setCode(code)
    if (code) chooseReward('')
  }

  function setFulfillment(next: Fulfillment) {
    if (next.mode === 'delivery') setEmirate(next.emirate)
    else setSlot(next.slot)
  }

  function changeMode(next: FulfillmentMode) {
    setMode(next)
    setErrors((previous) => ({ name: previous.name, phone: previous.phone, email: previous.email }))
    setNotice(null)
  }

  function clearError(name: string) {
    setErrors((previous) => previous[name] ? { ...previous, [name]: undefined } : previous)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    if (selectedReward && quote.status !== 'eligible') {
      setNotice('rewardCheckoutInvalid')
      return
    }
    const errors = validateCheckout(event.currentTarget, fulfillment, subtotal)
    setErrors(errors)
    const firstError = Object.keys(errors)[0]
    if (firstError) {
      setNotice('reviewErrors')
      requestAnimationFrame(() => document.getElementById(`checkout-${firstError}`)?.focus())
      return
    }
    submitting.current = true
    const result = await createOrder(fulfillment, payment, code, selectedReward || undefined)
    if ('error' in result) {
      setNotice(result.error)
      submitting.current = false
      return
    }
    navigate(`/order/${result.order.id}`, { replace: true })
  }

  return (
    <div className="ordering-page">
      <OrderHero title={t('orderHeading')} intro={t('orderIntro')} />
      {!cart.length ? (
        <div className="container order-content">
          <section className="order-card order-empty cart-empty">
            <ShoppingBag size={40} strokeWidth={1.2} aria-hidden="true" />
            <h2>{t('cartEmpty')}</h2><p>{t('cartEmptyText')}</p>
            {selectedReward && <p>{t('rewardAddDishes')}</p>}
            <div className="order-actions">
              <Link className="button button--forest" to="/menu">{t('browseMenu')}</Link>
              {latest && <Link className="button button--line" to={`/order/${latest.id}/track`}>{t('resumeTracking')}</Link>}
            </div>
          </section>
        </div>
      ) : (
        <div className="container order-content order-grid">
          <div className="order-main">
            <section className="order-card" aria-labelledby="cart-review-heading">
              <div className="order-card-header">
                <h2 id="cart-review-heading">{t('itemReview')}</h2>
                <button className="cart-text-button" type="button" onClick={async () => {
                  await clear()
                  requestAnimationFrame(() => document.getElementById('order-page-title')?.focus())
                }}>{t('clearCart')}</button>
              </div>
              <CartLines fallbackId="order-page-title" />
            </section>
            <OrderRecommendations />
            <CheckoutForm {...{ fulfillment, setFulfillment, changeMode, payment, setPayment, subtotal, errors, clearError }} onSubmit={submit} />
          </div>
          <aside className="order-summary-wrap" aria-labelledby="checkout-summary-heading">
            <div className="order-card order-summary">
              <h2 id="checkout-summary-heading">{t('orderSummary')}</h2>
              <PromoBanner />
              <PromoField subtotal={subtotal} code={code} setCode={choosePromo} suggested={!selectedReward && manualCode === null ? candidate : ''} />
              <RewardPicker member={loyalty} cart={cart} subtotal={subtotal} selected={selectedReward} setSelected={chooseReward}
                code={availableCode} codeSaving={getPromotion(availableCode, subtotal).discount} useCode={choosePromo} />
              {mode === 'delivery' && <FreeDeliveryProgress subtotal={subtotal} />}
              <OrderAmounts amounts={amounts} showDelivery={mode === 'delivery'} pendingFee={mode === 'delivery' && !emirate} />
              {loyalty && <p className="checkout-reward-estimate" data-testid="loyalty-estimate">
                {t('rewardsEstimate').replace('{points}', loyaltyNumber(earnsPoints(subtotal - amounts.discount, membershipTotals(loyalty).tier), language))}
              </p>}
              {notice && <p className="field-error" role="alert">{t(notice)}</p>}
              <button className="button button--forest order-submit" type="submit" form={checkoutFormId}>{t('submitOrder')}</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
