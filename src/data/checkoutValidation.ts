import type { CopyKey } from '../i18n/copy'
import type { Fulfillment } from '../types/ordering'
import { isEmail, isUaePhone } from './contactValidation'
import { getDeliveryService, getPickupSlot } from './orderMath'

export type CheckoutErrors = Partial<Record<string, CopyKey>>

export function validateCheckout(form: HTMLFormElement, fulfillment: Fulfillment, subtotal: number): CheckoutErrors {
  const data = new FormData(form)
  const value = (name: string) => String(data.get(name) ?? '').trim()
  const errors: CheckoutErrors = {}
  if (!value('name')) errors.name = 'requiredField'
  if (!isUaePhone(value('phone'))) errors.phone = 'phoneError'
  const email = form.elements.namedItem('email')
  if (!isEmail(value('email')) || (email instanceof HTMLInputElement && email.validity.typeMismatch)) errors.email = 'emailError'

  if (fulfillment.mode === 'delivery') {
    const service = getDeliveryService(fulfillment.emirate)
    if (!service || subtotal < service.minimum) errors.emirate = service ? 'invalidFulfillment' : 'requiredField'
    if (!value('district')) errors.district = 'requiredField'
    if (!value('building')) errors.building = 'requiredField'
  } else if (!getPickupSlot(fulfillment.slot)) {
    errors.pickup = 'requiredField'
  }
  return errors
}
