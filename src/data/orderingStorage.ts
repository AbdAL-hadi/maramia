import { readStorage } from '../hooks/storage'
import type { Localized } from '../types'
import type { CartLine, DemoOrder, OrderItem } from '../types/ordering'
import { matchesSelection, maxCartLines, maxInstructions, maxLineQuantity, resolveDish } from './orderMath'
import { rewardById, type LoyaltyMembership } from './loyalty'
import { parseMembership } from './loyaltyStorage'
import { readEventAttribution } from './marketingAnalytics'

export const orderingStorageKey = 'maramia.ordering.v1'
export const maxDemoOrders = 25

export type OrderingState = { cart: CartLine[]; orders: DemoOrder[]; loyalty?: LoyaltyMembership }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isLocalized(value: unknown): value is Localized {
  return isRecord(value) && typeof value.ar === 'string' && typeof value.en === 'string'
}

function isInteger(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max
}

function isOrderItem(value: unknown): value is OrderItem {
  return isRecord(value) && typeof value.itemId === 'string' && isLocalized(value.name)
    && (value.variant === null || isLocalized(value.variant))
    && isInteger(value.quantity, 1, maxLineQuantity) && isInteger(value.unitPrice)
}

function isDemoOrder(value: unknown): value is DemoOrder {
  if (!isRecord(value) || typeof value.id !== 'string' || !/^MRA-[A-F0-9]{10}$/.test(value.id)) return false
  if (value.mode !== 'delivery' && value.mode !== 'pickup') return false
  if (value.payment !== 'cash' && value.payment !== 'card' && value.payment !== 'apple-pay') return false
  if (!Array.isArray(value.window) || value.window.length !== 2 || !value.window.every((entry) => isInteger(entry, 1, 1440)) || value.window[0] > value.window[1]) return false
  if (!Array.isArray(value.items) || value.items.length < 1 || value.items.length > maxCartLines || !value.items.every(isOrderItem)) return false
  if (!isRecord(value.amounts) || !isInteger(value.stage, 0, 4)) return false
  const { subtotal, discount, deliveryFee, total } = value.amounts
  return isInteger(subtotal) && isInteger(discount, 0, subtotal) && isInteger(deliveryFee)
    && isInteger(total) && total === subtotal - discount + deliveryFee
    && subtotal === value.items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
}

export function loadOrdering(): OrderingState {
  const stored = readStorage<unknown>(orderingStorageKey, null)
  if (!isRecord(stored)) return { cart: [], orders: [] }
  const cart: CartLine[] = []
  if (Array.isArray(stored.cart)) {
    for (const line of stored.cart.slice(0, maxCartLines)) {
      if (!isRecord(line) || typeof line.id !== 'string' || !line.id || cart.some((entry) => entry.id === line.id)) continue
      if (typeof line.itemId !== 'string' || (line.variantId !== null && typeof line.variantId !== 'string')) continue
      if (!isInteger(line.quantity, 1) || typeof line.instructions !== 'string') continue
      const selection = {
        id: line.id, itemId: line.itemId, variantId: line.variantId,
        quantity: Math.min(line.quantity, maxLineQuantity),
        instructions: line.instructions.trim().slice(0, maxInstructions),
      }
      if (!resolveDish(selection)) continue
      const same = cart.find((entry) => matchesSelection(entry, selection))
      if (same) same.quantity = Math.min(same.quantity + selection.quantity, maxLineQuantity)
      else cart.push(selection)
    }
  }
  const orders = Array.isArray(stored.orders) ? stored.orders.filter(isDemoOrder).slice(0, maxDemoOrders).map((order) => ({
    id: order.id, mode: order.mode, payment: order.payment, window: order.window, stage: order.stage,
    ...(order.amounts.discount > 0 && rewardById(order.rewardId) ? { rewardId: order.rewardId } : {}),
    ...(readEventAttribution(order.attribution) ? { attribution: readEventAttribution(order.attribution) } : {}),
    amounts: {
      subtotal: order.amounts.subtotal, discount: order.amounts.discount,
      deliveryFee: order.amounts.deliveryFee, total: order.amounts.total,
    },
    items: order.items.map((item) => ({
      itemId: item.itemId, quantity: item.quantity, unitPrice: item.unitPrice,
      name: { ar: item.name.ar, en: item.name.en },
      variant: item.variant ? { ar: item.variant.ar, en: item.variant.en } : null,
      ...(item.variantId === null || (typeof item.variantId === 'string' && /^[a-z0-9-]{1,40}$/.test(item.variantId)) ? { variantId: item.variantId } : {}),
    })),
  })) : []
  const loyalty = parseMembership(stored.loyalty)
  return loyalty ? { cart, orders, loyalty } : { cart, orders }
}
