import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  calculateAmounts, calculateSubtotal, getDeliveryService, getPickupSlot, getPromotion, matchesSelection,
  maxCartLines, maxInstructions, maxLineQuantity, quoteReward, resolveDish,
} from '../data/orderMath'
import { loadOrdering, maxDemoOrders, orderingStorageKey, type OrderingState } from '../data/orderingStorage'
import { completedOrderStage, earnsPoints, membershipTotals, rewardById, visitPoints, welcomePoints, type LoyaltyMembership, type LoyaltyPreferences, type LoyaltyTransaction } from '../data/loyalty'
import { cleanLoyaltyPreferences } from '../data/loyaltyStorage'
import { currentEventAttribution, recordEvent, type EventAttribution } from '../data/marketingAnalytics'
import { loadBookings, reservationStorageKey } from '../data/reservationStorage'
import { dubaiInstant } from '../data/reservationTime'
import { withStorageLock, writeStorage } from '../hooks/storage'
import type { DishSelection } from '../types/menu'
import type { CartLine, DemoOrder, Fulfillment, OrderItem, PaymentMethod } from '../types/ordering'

type CartResult = 'ok' | 'limit' | 'unavailable'
type OrderResult = { order: DemoOrder } | { error: 'orderStorage' | 'cartEmpty' | 'invalidFulfillment' | 'rewardCheckoutInvalid' | 'rewardConflict' }
type VisitResult = 'ok' | 'visitIneligible' | 'visitAlreadyEarned' | 'rewardsJoinFirst' | 'orderStorage'

type Ordering = OrderingState & {
  itemCount: number
  subtotal: number
  add: (selection: DishSelection) => Promise<CartResult>
  addMany: (selections: readonly DishSelection[]) => Promise<CartResult>
  update: (id: string, changes: Partial<Pick<DishSelection, 'quantity' | 'variantId' | 'instructions'>>) => Promise<CartResult>
  remove: (id: string) => Promise<void>
  clear: () => Promise<void>
  createOrder: (fulfillment: Fulfillment, payment: PaymentMethod, code: string, rewardId?: string) => Promise<OrderResult>
  advance: (id: string, expectedStage: number) => Promise<boolean>
  joinRewards: () => Promise<boolean>
  saveLoyaltyPreferences: (preferences: LoyaltyPreferences) => Promise<boolean>
  completeVisit: (reference: string) => Promise<VisitResult>
}

const OrderingContext = createContext<Ordering | null>(null)

function randomId(bytes: number) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function withTransaction(member: LoyaltyMembership, transaction: LoyaltyTransaction): LoyaltyMembership {
  return { ...member, ledger: [...member.ledger, transaction] }
}

function trackTierUpgrade(previous: LoyaltyMembership, next: LoyaltyMembership, reference: string, attribution?: EventAttribution) {
  const tier = membershipTotals(next).tier.id
  if (tier !== membershipTotals(previous).tier.id) void recordEvent('loyalty_tier_upgrade', { ...attribution, tier, reference }, reference)
}

export function OrderingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadOrdering)
  const volatileCart = useRef<CartLine[] | null>(null)

  function latest(): OrderingState {
    const stored = loadOrdering()
    return volatileCart.current ? { ...stored, cart: volatileCart.current } : stored
  }

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === orderingStorageKey || event.key === null) setState(latest())
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  function commit(next: OrderingState, requiresStorage = true) {
    const saved = writeStorage(orderingStorageKey, next)
    if (!saved && requiresStorage) return false
    volatileCart.current = saved ? null : next.cart
    setState(next)
    return true
  }

  async function mutate<T>(fallback: T, operation: (snapshot: OrderingState) => T) {
    try {
      return await withStorageLock(orderingStorageKey, () => operation(latest()))
    } catch {
      return fallback
    }
  }

  function addMany(selections: readonly DishSelection[]) {
    return mutate<CartResult>('unavailable', (snapshot) => {
      if (!selections.length) return 'ok'
      const cart = [...snapshot.cart]
      const events: { itemId: string; quantity: number; value: number }[] = []
      for (const selection of selections) {
        const dish = resolveDish(selection)
        if (!dish) return 'unavailable'
        if (!Number.isSafeInteger(selection.quantity) || selection.quantity < 1 || selection.quantity > maxLineQuantity) return 'limit'
        const next = { ...selection, instructions: selection.instructions.trim().slice(0, maxInstructions) }
        const index = cart.findIndex((line) => matchesSelection(line, next))
        const same = cart[index]
        if (same) {
          if (same.quantity + next.quantity > maxLineQuantity) return 'limit'
          cart[index] = { ...same, quantity: same.quantity + next.quantity }
        } else {
          if (cart.length >= maxCartLines) return 'limit'
          cart.push({ ...next, id: randomId(10) })
        }
        events.push({ itemId: selection.itemId, quantity: selection.quantity, value: dish.unitPrice * selection.quantity })
      }
      commit({ ...snapshot, cart }, false)
      for (const event of events) void recordEvent('add_to_cart', event)
      return 'ok'
    })
  }

  function update(id: string, changes: Partial<Pick<DishSelection, 'quantity' | 'variantId' | 'instructions'>>) {
    return mutate<CartResult>('unavailable', (snapshot) => {
      const { cart } = snapshot
      const previous = cart.find((line) => line.id === id)
      if (!previous) return 'unavailable'
      const next = { ...previous, ...changes }
      next.instructions = next.instructions.trim().slice(0, maxInstructions)
      if (!resolveDish(next)) return 'unavailable'
      const same = cart.find((line) => line.id !== id && matchesSelection(line, next))
      next.quantity += same?.quantity ?? 0
      if (!Number.isSafeInteger(next.quantity) || next.quantity < 1 || next.quantity > maxLineQuantity) return 'limit'
      commit({ ...snapshot, cart: cart.filter((line) => line.id !== same?.id).map((line) => line.id === id ? next : line) }, false)
      return 'ok'
    })
  }

  function changeCart(transform: (cart: CartLine[]) => CartLine[]) {
    return mutate<void>(undefined, (snapshot) => { commit({ ...snapshot, cart: transform(snapshot.cart) }, false) })
  }

  function createOrder(fulfillment: Fulfillment, payment: PaymentMethod, code: string, rewardId?: string) {
    const attribution = currentEventAttribution()
    return mutate<OrderResult>({ error: 'orderStorage' }, (snapshot) => {
      const { cart, orders } = snapshot
      let { loyalty } = snapshot
      if (!cart.length) return { error: 'cartEmpty' }
      const subtotal = calculateSubtotal(cart)
      const service = fulfillment.mode === 'delivery' ? getDeliveryService(fulfillment.emirate) : null
      const window = fulfillment.mode === 'delivery' ? service?.window : getPickupSlot(fulfillment.slot)?.window
      if (!window || (service && subtotal < service.minimum)) return { error: 'invalidFulfillment' }
      const reward = rewardById(rewardId)
      const quote = quoteReward(reward, loyalty, cart, subtotal)
      if (rewardId && (!loyalty || quote.status !== 'eligible')) return { error: 'rewardCheckoutInvalid' }
      const promo = getPromotion(code, subtotal)
      if (reward && promo.status === 'applied') return { error: 'rewardConflict' }
      const items: OrderItem[] = []
      for (const line of cart) {
        const dish = resolveDish(line)
        if (!dish) return { error: 'cartEmpty' }
        items.push({
          itemId: line.itemId,
          name: { ar: dish.item.nameAr, en: dish.item.nameEn },
          variantId: line.variantId, variant: dish.variant?.name ?? null,
          quantity: line.quantity, unitPrice: dish.unitPrice,
        })
      }
      let id: string
      do {
        id = 'MRA-' + randomId(5).toUpperCase()
      } while (orders.some((order) => order.id === id) || loyalty?.ledger.some((transaction) => transaction.reference === id))

      const order: DemoOrder = {
        id, mode: fulfillment.mode, payment, window, items,
        amounts: calculateAmounts(subtotal, fulfillment, code, reward ? quote.discount : 0),
        stage: 0, attribution, ...(reward ? { rewardId: reward.id } : {}),
      }
      if (reward && loyalty) {
        loyalty = withTransaction(loyalty, {
          id: 'redeem:' + id, type: 'redeem', points: -reward.points, reference: id, rewardId: reward.id,
          timestamp: Math.max(Date.now(), loyalty.joinedAt),
        })
      }
      // The order, reward debit, and cart update share one storage commit.
      if (!commit({ ...snapshot, orders: [order, ...orders].slice(0, maxDemoOrders), cart: [], loyalty })) return { error: 'orderStorage' }
      const appliedCode = !reward && promo.status === 'applied' ? promo.code : undefined
      void recordEvent('order_completed', {
        ...attribution, reference: id, value: order.amounts.total, items: items.map(({ itemId, quantity }) => ({ itemId, quantity })), code: appliedCode,
      }, id)
      if (appliedCode) void recordEvent('promo_redeemed', { ...attribution, reference: id, code: appliedCode, value: order.amounts.discount }, id)
      if (reward) void recordEvent('loyalty_reward_redeemed', {
        ...attribution, reference: id, rewardId: reward.id, points: reward.points, value: order.amounts.discount,
      }, id)
      return { order }
    })
  }

  function advance(id: string, expectedStage: number) {
    return mutate(false, (snapshot) => {
      const order = snapshot.orders.find((entry) => entry.id === id)
      if (!order) return false
      if (order.stage !== expectedStage || order.stage >= completedOrderStage) {
        setState(snapshot)
        return true
      }
      const stage = order.stage + 1
      const orders = snapshot.orders.map((entry) => entry.id === id ? { ...entry, stage } : entry)
      const member = snapshot.loyalty
      if (stage !== completedOrderStage || !member || member.ledger.some((entry) => entry.id === 'order:' + id)) {
        return commit({ ...snapshot, orders })
      }
      const { tier, orders: previousOrderCount } = membershipTotals(member)
      const net = order.amounts.subtotal - order.amounts.discount
      const points = earnsPoints(net, tier)
      const next = withTransaction(member, {
        id: 'order:' + id, type: 'order', reference: id, timestamp: Math.max(Date.now(), member.joinedAt), points, earnedTier: tier.id,
      })
      if (!commit({ ...snapshot, orders, loyalty: next })) return false
      const repeat = previousOrderCount > 0
      const details = { ...order.attribution, reference: id, tier: tier.id, points, value: order.amounts.total, repeat }
      void recordEvent('loyalty_order_points', details, id)
      if (repeat) void recordEvent('loyalty_repeat_order', details, id)
      trackTierUpgrade(member, next, id, order.attribution)
      return true
    })
  }

  function joinRewards() {
    return mutate(false, (snapshot) => {
      if (snapshot.loyalty) {
        setState(snapshot)
        return true
      }
      const joinedAt = Date.now()
      const loyalty: LoyaltyMembership = {
        version: 1, id: 'MR-' + randomId(6).toUpperCase(), joinedAt, preferences: {},
        ledger: [{ id: 'welcome', type: 'welcome', points: welcomePoints, timestamp: joinedAt }],
      }
      if (!commit({ ...snapshot, loyalty })) return false
      void recordEvent('loyalty_join', { tier: 'sage' })
      void recordEvent('loyalty_welcome', { tier: 'sage', points: welcomePoints })
      return true
    })
  }

  function saveLoyaltyPreferences(preferences: LoyaltyPreferences) {
    return mutate(false, (snapshot) => {
      if (!snapshot.loyalty) return false
      return commit({ ...snapshot, loyalty: { ...snapshot.loyalty, preferences: cleanLoyaltyPreferences(preferences) } })
    })
  }

  async function completeVisit(reference: string): Promise<VisitResult> {
    try {
      return await withStorageLock(reservationStorageKey, () => mutate<VisitResult>('orderStorage', (snapshot) => {
        const member = snapshot.loyalty
        if (!member) return 'rewardsJoinFirst'
        const booking = loadBookings().find(({ id }) => id === reference)
        const now = Date.now()
        if (!booking || booking.status === 'cancelled' || dubaiInstant(booking.date, booking.time).getTime() > now) return 'visitIneligible'
        const id = 'visit:' + reference
        if (member.ledger.some((entry) => entry.id === id)) return 'visitAlreadyEarned'
        const next = withTransaction(member, { id, type: 'visit', reference, points: visitPoints, timestamp: Math.max(now, member.joinedAt) })
        if (!commit({ ...snapshot, loyalty: next })) return 'orderStorage'
        void recordEvent('loyalty_visit_points', { reference, points: visitPoints }, reference)
        trackTierUpgrade(member, next, reference)
        return 'ok'
      }))
    } catch {
      return 'orderStorage'
    }
  }

  return (
    <OrderingContext.Provider value={{
      ...state,
      itemCount: state.cart.reduce((count, line) => count + line.quantity, 0),
      subtotal: calculateSubtotal(state.cart),
      add: (selection) => addMany([selection]), addMany, update, createOrder, advance, joinRewards, saveLoyaltyPreferences, completeVisit,
      remove: (id) => changeCart((cart) => cart.filter((line) => line.id !== id)),
      clear: () => changeCart(() => []),
    }}>
      {children}
    </OrderingContext.Provider>
  )
}

export function useOrdering() {
  const context = useContext(OrderingContext)
  if (!context) throw new Error('OrderingProvider is required')
  return context
}
