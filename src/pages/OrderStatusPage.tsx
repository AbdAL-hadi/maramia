import { m } from 'framer-motion'
import { Check, CircleCheck, Clock3, ReceiptText, Truck } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { paymentLabel, WindowText } from '../components/order/CheckoutForm'
import { Money, OrderAmounts } from '../components/order/OrderAmounts'
import { OrderHero } from '../components/order/OrderHero'
import { LoyaltyNotice } from '../components/loyalty/LoyaltySummary'
import { useLanguage } from '../context/LanguageContext'
import { useOrdering } from '../context/OrderingContext'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { CopyKey } from '../i18n/copy'
import type { DemoOrder } from '../types/ordering'
import { rewardById } from '../data/loyalty'

function OrderReference({ order }: { order: DemoOrder }) {
  const { t } = useLanguage()
  return (
    <dl className="order-reference">
      <div><dt>{t('orderNumber')}</dt><dd><bdi data-testid="order-number">{order.id}</bdi></dd></div>
      <div><dt>{t('fulfillment')}</dt><dd>{t(order.mode)}</dd></div>
      <div><dt>{t('estimate')}</dt><dd><WindowText window={order.window} /></dd></div>
      <div><dt>{t('payment')}</dt><dd>{t(paymentLabel(order.payment, order.mode))}</dd></div>
    </dl>
  )
}

function Confirmation({ order }: { order: DemoOrder }) {
  const { language, t } = useLanguage()
  const reward = rewardById(order.rewardId)
  return (
    <>
      <OrderHero title={t('confirmation')} intro={t('confirmationText')} />
      <div className="container order-content order-status-grid">
        <section className="order-card order-confirmation" aria-labelledby="confirmation-details">
          <div className="order-card-header">
            <h2 id="confirmation-details">{t('orderDetails')}</h2>
            <CircleCheck aria-hidden="true" size={28} />
          </div>
          <OrderReference order={order} />
          <LoyaltyNotice order={order} />
          <div className="order-actions">
            <Link to={`/order/${order.id}/track`} className="button button--forest">{t('trackOrder')}</Link>
            <Link to="/menu" className="button button--line">{t('returnToMenu')}</Link>
          </div>
        </section>
        <section className="order-card" aria-labelledby="confirmation-summary">
          <h2 id="confirmation-summary">{t('orderSummary')}</h2>
          <ul className="confirmation-items" role="list">
            {order.items.map((item, index) => (
              <li key={`${item.itemId}-${index}`}>
                <div><bdi>{item.quantity} ×</bdi> {item.name[language]}{item.variant && <small>{item.variant[language]}</small>}</div>
                <Money fils={item.unitPrice * item.quantity} />
              </li>
            ))}
          </ul>
          <OrderAmounts amounts={order.amounts} showDelivery={order.mode === 'delivery'} />
          {reward && <p className="checkout-reward-estimate"><strong>{t('rewardUsed')}</strong> · {reward.name[language]}</p>}
        </section>
      </div>
    </>
  )
}

function Tracking({ order }: { order: DemoOrder }) {
  const { t } = useLanguage()
  const { advance } = useOrdering()
  const reduced = useReducedMotion()
  const [error, setError] = useState(false)
  const statusHeading = useRef<HTMLHeadingElement>(null)
  const advancing = useRef(false)
  const stages: CopyKey[] = ['orderReceived', 'statusConfirmed', 'preparing', order.mode === 'delivery' ? 'outForDelivery' : 'readyForPickup', 'completed']
  const finished = order.stage === stages.length - 1
  return (
    <>
      <OrderHero title={t('trackingHeading')} intro={t('trackingIntro')} />
      <div className="container order-content order-status-grid">
        <section className="order-card order-tracking" aria-labelledby="tracking-current-heading">
          <div className="tracking-current" aria-live="polite">
            <m.h2 key={order.stage} id="tracking-current-heading" ref={statusHeading} tabIndex={-1} initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.25 }}>
              {t(stages[order.stage])}
            </m.h2>
          </div>
          <ol className="tracking-timeline" aria-label={t('trackingHeading')}>
            {stages.map((stage, index) => {
              const Icon = index < order.stage ? Check : index === 0 ? ReceiptText : index === 3 ? Truck : index === 4 ? CircleCheck : Clock3
              return (
                <li key={stage} className={index <= order.stage ? 'timeline-reached' : undefined} aria-current={index === order.stage ? 'step' : undefined}>
                  <span><Icon size={17} aria-hidden="true" /></span>{t(stage)}
                </li>
              )
            })}
          </ol>
          <div className="tracking-demo-control">
            <strong>{t('presenterControl')}</strong>
            {finished ? <p>{t('trackingComplete')}</p> : (
              <button className="button button--forest" type="button" onClick={async () => {
                if (advancing.current) return
                advancing.current = true
                const saved = await advance(order.id, order.stage)
                advancing.current = false
                setError(!saved)
                if (saved && order.stage === stages.length - 2) requestAnimationFrame(() => statusHeading.current?.focus({ preventScroll: true }))
              }}>{t('advanceTracking')}</button>
            )}
            {error && <p role="alert" className="field-error">{t('trackingStorage')}</p>}
          </div>
        </section>
        <section className="order-card order-tracking-reference" aria-labelledby="tracking-reference-heading">
          <h2 id="tracking-reference-heading">{t('orderDetails')}</h2>
          <OrderReference order={order} />
          <LoyaltyNotice order={order} />
          <div className="order-actions">
            <Link className="button button--line" to={`/order/${order.id}`}>{t('viewConfirmation')}</Link>
            <Link className="button button--line" to="/menu">{t('returnToMenu')}</Link>
          </div>
        </section>
      </div>
    </>
  )
}

export function OrderStatusPage({ tracking = false }: { tracking?: boolean }) {
  const { orderId } = useParams()
  const { orders } = useOrdering()
  const { t } = useLanguage()
  const order = orders.find(({ id }) => id === orderId)

  return (
    <div className="ordering-page">
      {order ? (tracking ? <Tracking key={order.id} order={order} /> : <Confirmation order={order} />) : (
        <>
          <OrderHero title={t('orderMissing')} intro={t('orderMissingText')} />
          <div className="container order-content">
            <Link className="button button--forest" to="/menu">{t('returnToMenu')}</Link>
          </div>
        </>
      )}
    </div>
  )
}
