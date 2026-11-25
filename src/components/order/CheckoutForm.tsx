import { Banknote, CreditCard, MapPin, Smartphone, Store, Truck } from 'lucide-react'
import type { FormEventHandler, ReactNode } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import type { CheckoutErrors } from '../../data/checkoutValidation'
import { aedCurrency } from '../../data/menuFilters'
import { getDeliveryService } from '../../data/orderMath'
import { deliveryServices, pickupSlots } from '../../data/ordering'
import type { CopyKey } from '../../i18n/copy'
import type { Fulfillment, FulfillmentMode, PaymentMethod, TimeWindow } from '../../types/ordering'

export const checkoutFormId = 'maramia-checkout-form'
type FieldAttributes = { id: string; name: string; required?: boolean; 'aria-invalid'?: true; 'aria-describedby'?: string }

export function paymentLabel(payment: PaymentMethod, mode: FulfillmentMode): CopyKey {
  if (payment === 'card') return 'cardDemo'
  if (payment === 'apple-pay') return 'appleDemo'
  return mode === 'delivery' ? 'cashDelivery' : 'cashPickup'
}

export function WindowText({ window: [min, max] }: { window: TimeWindow }) {
  const { language, t } = useLanguage()
  const number = new Intl.NumberFormat(language === 'ar' ? 'ar-AE' : 'en-AE')
  return <><bdi dir="ltr">{number.format(min)}–{number.format(max)}</bdi> {t('minutes')}</>
}

function Field({ label, name, error, optional, children }: {
  label: CopyKey
  name: string
  error?: CopyKey
  optional?: boolean
  children: (attributes: FieldAttributes) => ReactNode
}) {
  const { t } = useLanguage()
  const id = `checkout-${name}`
  return (
    <div className="order-field">
      <label htmlFor={id}>{t(label)}{optional && <small> ({t('optional')})</small>}</label>
      {children({ id, name, required: !optional, 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? `${id}-error` : undefined })}
      {error && <small className="field-error" id={`${id}-error`}>{t(error)}</small>}
    </div>
  )
}

export function CheckoutForm({ fulfillment, setFulfillment, changeMode, payment, setPayment, subtotal, errors, clearError, onSubmit }: {
  fulfillment: Fulfillment
  setFulfillment: (fulfillment: Fulfillment) => void
  changeMode: (mode: FulfillmentMode) => void
  payment: PaymentMethod
  setPayment: (method: PaymentMethod) => void
  subtotal: number
  errors: CheckoutErrors
  clearError: (name: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
}) {
  const { language, t } = useLanguage()
  const delivery = fulfillment.mode === 'delivery'
  const service = delivery ? getDeliveryService(fulfillment.emirate) : null
  return (
    <form id={checkoutFormId} className="checkout-fields" noValidate onSubmit={onSubmit} onChange={(event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) clearError(event.target.name)
    }}>
      <section className="order-card">
        <fieldset className="order-fieldset">
          <legend>{t('fulfillment')}</legend>
          <div className="order-choice-grid">
            {([{ id: 'delivery', icon: Truck }, { id: 'pickup', icon: Store }] as const).map(({ id, icon: Icon }) => (
              <label className="order-choice" key={id}>
                <input type="radio" name="fulfillment" value={id} checked={fulfillment.mode === id} onChange={() => changeMode(id)} />
                <Icon size={20} aria-hidden="true" /><span>{t(id)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>
      <section className="order-card" aria-labelledby="checkout-contact-heading">
        <h2 id="checkout-contact-heading">{t('customerDetails')}</h2>
        <p className="order-help">{t('demoDataNote')}</p>
        <div className="order-fields-grid">
          <Field label="name" name="name" error={errors.name}>{(props) => <input {...props} autoComplete="name" maxLength={100} dir="auto" />}</Field>
          <Field label="phone" name="phone" error={errors.phone}>{(props) => <input {...props} type="tel" autoComplete="tel" maxLength={30} placeholder="+971 5X XXX XXXX" dir="ltr" />}</Field>
          <Field label="email" name="email" error={errors.email}>{(props) => <input {...props} type="email" autoComplete="email" maxLength={254} dir="ltr" />}</Field>
        </div>
      </section>

      <section className="order-card" aria-labelledby="checkout-address-heading" hidden={!delivery}>
        <h2 id="checkout-address-heading">{t('deliveryDetails')}</h2>
        <p className="order-help">{t('deliveryDemo')}</p>
        <fieldset className="order-fields-grid" disabled={!delivery}>
          <Field label="emirate" name="emirate" error={errors.emirate}>{(props) => (
            <select {...props} autoComplete="address-level1" value={delivery ? fulfillment.emirate : ''} onChange={(event) => setFulfillment({ mode: 'delivery', emirate: event.target.value })}>
              <option value="">{t('chooseEmirate')}</option>
              {Object.entries(deliveryServices).map(([id, location]) => <option value={id} key={id}>{location.name[language]}</option>)}
            </select>
          )}</Field>
          <Field label="district" name="district" error={errors.district}>{(props) => <input {...props} autoComplete="address-level3" maxLength={120} dir="auto" />}</Field>
          <Field label="building" name="building" error={errors.building}>{(props) => <input {...props} autoComplete="address-line1" maxLength={120} dir="auto" />}</Field>
          <Field label="apartment" name="apartment" optional>{(props) => <input {...props} autoComplete="address-line2" maxLength={30} dir="auto" />}</Field>
          <Field label="addressDetails" name="address-details" optional>{(props) => <textarea {...props} maxLength={250} rows={2} dir="auto" />}</Field>
          <Field label="deliveryInstructions" name="delivery-instructions" optional>{(props) => <textarea {...props} maxLength={250} rows={2} dir="auto" />}</Field>
        </fieldset>
        {service && (
          <div className="fulfillment-estimate" aria-live="polite">
            <p>{t('estimate')} <strong><WindowText window={service.window} /></strong></p>
            <p className={subtotal < service.minimum ? 'field-error' : undefined}>{t('deliveryMinimum').replace('{amount}', aedCurrency[language].format(service.minimum / 100))}</p>
          </div>
        )}
      </section>

      <section className="order-card" aria-labelledby="checkout-pickup-heading" hidden={delivery}>
        <h2 id="checkout-pickup-heading">{t('pickupDetails')}</h2>
        <p className="order-location"><MapPin size={17} aria-hidden="true" />{t('pickupLocation')}</p>
        <fieldset className="order-fields-grid" disabled={delivery}>
          <Field label="pickupWindow" name="pickup" error={errors.pickup}>{(props) => (
            <select {...props} value={!delivery ? fulfillment.slot : ''} onChange={(event) => setFulfillment({ mode: 'pickup', slot: event.target.value })}>
              <option value="">{t('choosePickup')}</option>
              {Object.entries(pickupSlots).map(([id, option]) => (
                <option value={id} key={id}>{option.name[language]} ({'\u2066'}{option.window.join('–')}{'\u2069'} {t('minutes')})</option>
              ))}
            </select>
          )}</Field>
          <Field label="pickupInstructions" name="pickup-instructions" optional>{(props) => <textarea {...props} maxLength={250} rows={2} dir="auto" />}</Field>
        </fieldset>
      </section>

      <section className="order-card">
        <fieldset className="order-fieldset">
          <legend>{t('payment')}</legend>
          <div className="payment-options">
            {([{ id: 'cash', icon: Banknote }, { id: 'card', icon: CreditCard }, { id: 'apple-pay', icon: Smartphone }] as const).map(({ id, icon: Icon }) => (
              <label className="order-choice" key={id}>
                <input type="radio" name="payment" value={id} checked={payment === id} onChange={() => setPayment(id)} />
                <Icon size={20} aria-hidden="true" /><span>{t(paymentLabel(id, fulfillment.mode))}</span>
              </label>
            ))}
          </div>
          <p className="order-help">{t('paymentDemo')}</p>
        </fieldset>
        <Field label="orderNotes" name="order-notes" optional>{(props) => <textarea {...props} maxLength={250} rows={2} dir="auto" />}</Field>
      </section>
    </form>
  )
}
