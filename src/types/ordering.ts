import type { Localized } from './index'
import type { DishSelection } from './menu'
import type { EventAttribution } from '../data/marketingAnalytics'

export type CartLine = DishSelection & { id: string }
export type FulfillmentMode = 'delivery' | 'pickup'
export type PaymentMethod = 'cash' | 'card' | 'apple-pay'
export type TimeWindow = readonly [number, number]
export type Fulfillment =
  | { mode: 'delivery'; emirate: string }
  | { mode: 'pickup'; slot: string }

export type OrderAmounts = {
  subtotal: number
  discount: number
  deliveryFee: number
  total: number
}

export type OrderItem = {
  itemId: string
  name: Localized
  variant: Localized | null
  variantId?: string | null
  quantity: number
  unitPrice: number
}

export type DemoOrder = {
  id: string
  mode: FulfillmentMode
  payment: PaymentMethod
  window: TimeWindow
  amounts: OrderAmounts
  items: OrderItem[]
  stage: number
  rewardId?: string
  attribution?: EventAttribution
}
