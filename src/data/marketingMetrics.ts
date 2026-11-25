import { campaigns, referrals } from './campaigns'
import { sources, workspaceEvents, type AcquisitionSource, type EventType, type MarketingEvent } from './marketingAnalytics'
import { summarizeFeedback } from './customerFeedback'
import { quizFields } from './marketingPreferences'
import { addCalendarDays, dubaiInstant, dubaiNow } from './reservationTime'

export type MarketingFilters = { from: string; to: string; campaignId: string; source: AcquisitionSource | '' }

export function defaultMarketingFilters(now = new Date()): MarketingFilters {
  const today = dubaiNow(now).date
  return { from: addCalendarDays(today, -29), to: today, campaignId: '', source: '' }
}

const stages: readonly (readonly EventType[])[] = [
  ['campaign_visit'], ['menu_view', 'item_view'], ['add_to_cart'], ['checkout_start'], ['order_completed'],
]

function distinctSessions(events: readonly MarketingEvent[]) {
  return new Set(events.map(({ sessionId }) => sessionId)).size
}

function rate(numerator: number, denominator: number) {
  return denominator ? numerator / denominator : 0
}

function total(events: readonly MarketingEvent[]) {
  return events.reduce((sum, event) => sum + (event.value ?? 0), 0)
}

function rank(counts: Map<string, number>) {
  return [...counts].sort(([a, n], [b, m]) => m - n || a.localeCompare(b))
}

function addToCount(counts: Map<string, number>, key: string, value = 1) {
  counts.set(key, (counts.get(key) ?? 0) + value)
}

export function marketingMetrics(events: readonly MarketingEvent[], filters: MarketingFilters, cancelled: ReadonlySet<string>) {
  const scoped = events.filter((event) => {
    const day = dubaiNow(new Date(event.timestamp)).date
    return (!filters.from || day >= filters.from) && (!filters.to || day <= filters.to)
      && (!filters.campaignId || event.campaignId === filters.campaignId)
      && (!filters.source || event.source === filters.source)
  }).sort((a, b) => a.timestamp - b.timestamp)
  const ofType = (type: EventType) => scoped.filter((event) => event.type === type)
  const sequence = new Map(scoped.map((event, index) => [event.id, index]))
  const sessions = distinctSessions(scoped.filter((event) => !workspaceEvents.some((type) => type === event.type)))
  const visits = ofType('campaign_visit')
  const orders = ofType('order_completed')
  const reservations = ofType('reservation_completed').filter((event) => !event.reference || !cancelled.has(event.reference))
  const starts = ofType('quiz_start')
  const quizStarters = new Map<string, number>()
  for (const event of starts) if (!quizStarters.has(event.sessionId)) quizStarters.set(event.sessionId, sequence.get(event.id) ?? Infinity)
  const quiz = ofType('quiz_complete')
  const happenedAfter = (event: MarketingEvent, milestone: ReadonlyMap<string, number>) =>
    (sequence.get(event.id) ?? -1) > (milestone.get(event.sessionId) ?? Infinity)
  const quizFinishers = quiz.filter((event) => happenedAfter(event, quizStarters))
  const revenue = total(orders)

  const progression = new Map<string, number>()
  const funnel = stages.map(() => 0)
  for (const event of scoped) {
    const step = progression.get(event.sessionId) ?? 0
    if (stages[step]?.includes(event.type)) {
      funnel[step] += 1
      progression.set(event.sessionId, step + 1)
    }
  }

  const campaignRows = campaigns.filter(({ id }) => !filters.campaignId || id === filters.campaignId).map((campaign) => {
    const campaignVisits = visits.filter(({ campaignId }) => campaignId === campaign.id)
    const firstVisit = new Map<string, number>()
    for (const event of campaignVisits) {
      if (!firstVisit.has(event.sessionId)) firstVisit.set(event.sessionId, sequence.get(event.id) ?? Infinity)
    }
    const attributedOrders = orders.filter(({ campaignId }) => campaignId === campaign.id)
    const attributedReservations = reservations.filter(({ campaignId }) => campaignId === campaign.id)
    const afterVisit = (event: MarketingEvent) => happenedAfter(event, firstVisit)
    return {
      campaign, visits: campaignVisits.length, visitorSessions: firstVisit.size, orders: attributedOrders.length,
      reservations: attributedReservations.length, revenue: total(attributedOrders),
      orderRate: rate(distinctSessions(attributedOrders.filter(afterVisit)), firstVisit.size),
      reservationRate: rate(distinctSessions(attributedReservations.filter(afterVisit)), firstVisit.size),
    }
  })

  const acquisition = sources.map((source) => ({
    source,
    visits: distinctSessions(scoped.filter((event) => event.source === source &&
      (event.type === 'session_visit' || event.type === 'campaign_visit' || event.type === 'referral_visit'))),
  }))
  const referralVisits = ofType('referral_visit')
  const referralRows = Object.keys(referrals).map((code) => ({
    code, visits: referralVisits.filter(({ referral }) => referral === code).length,
    orders: orders.filter(({ referral }) => referral === code).length,
    reservations: reservations.filter(({ referral }) => referral === code).length,
  })).filter(({ visits, orders, reservations }) => visits || orders || reservations)
  const viewed = new Map<string, number>()
  const ordered = new Map<string, number>()
  const daily = new Map<string, number>()
  const preferenceRows = Object.fromEntries(quizFields.map((key) => [key, new Map<string, number>()]))
  for (const event of ofType('item_view')) {
    if (event.itemId) addToCount(viewed, event.itemId)
  }
  for (const order of orders) {
    addToCount(daily, dubaiNow(new Date(order.timestamp)).date, order.value ?? 0)
    for (const item of order.items ?? []) addToCount(ordered, item.itemId, item.quantity)
  }
  for (const event of new Map(quiz.map((event) => [event.sessionId, event])).values()) {
    for (const key of quizFields) {
      const value = event.preferences?.[key]
      if (value) addToCount(preferenceRows[key], value)
    }
  }
  const memberOrders = ofType('loyalty_order_points')
  const repeatOrders = memberOrders.filter(({ repeat }) => repeat)
  const redemptions = ofType('loyalty_reward_redeemed')
  const rewardCounts = new Map<string, number>()
  for (const { rewardId } of redemptions) if (rewardId) addToCount(rewardCounts, rewardId)
  const retention = {
    eligibleOrders: memberOrders.length, repeatRate: rate(repeatOrders.length, memberOrders.length),
    average: memberOrders.length ? Math.round(total(memberOrders) / memberOrders.length) : 0,
    repeatRevenue: total(repeatOrders), redemptions: redemptions.length,
    pointsRedeemed: redemptions.reduce((sum, event) => sum + (event.points ?? 0), 0),
    distribution: rank(rewardCounts),
  }
  return {
    sessions, campaignVisits: visits.length, orders: orders.length, reservations: reservations.length,
    revenue, average: orders.length ? Math.round(revenue / orders.length) : 0,
    orderRate: rate(distinctSessions(orders), sessions), reservationRate: rate(distinctSessions(reservations), sessions),
    redemptions: orders.filter(({ code }) => code).length, quizRate: rate(distinctSessions(quizFinishers), quizStarters.size),
    quizStarted: quizStarters.size, quizCompleted: distinctSessions(quizFinishers),
    funnel, campaignRows, acquisition, referralRows, viewed: rank(viewed), ordered: rank(ordered),
    preferences: quizFields.map((field) => ({ field, counts: rank(preferenceRows[field]) })), retention,
    daily: [...daily].sort(([a], [b]) => a.localeCompare(b)), eventCount: scoped.length,
    feedback: summarizeFeedback(ofType('customer_feedback').flatMap(({ ratings }) => ratings ? [ratings] : [])),
    tools: {
      graphics: ofType('graphic_generated').length, links: ofType('campaign_link_generated').length,
      qr: ofType('qr_generated').length, giftPreviews: ofType('gift_preview').length, gifts: ofType('gift_generated').length,
    },
  }
}

export type MarketingMetrics = ReturnType<typeof marketingMetrics>

export function sampleMarketingEvents(today: string) {
  const events: MarketingEvent[] = []
  for (let index = 0; index < 12; index += 1) {
    const campaign = campaigns[index % campaigns.length]
    const source = sources[index % 4]
    const sessionId = String(index).padStart(24, '0')
    const morning = dubaiInstant(addCalendarDays(today, -Math.floor(index / 2)), 540).getTime()
    let offset = 0
    const push = (type: EventType, details: Partial<MarketingEvent> = {}) => {
      offset += 1
      events.push({ id: 'sample-' + index + '-' + offset, type, sessionId, timestamp: morning + offset * 60000, source, campaignId: campaign.id, ...details })
    }
    push('session_visit')
    push('campaign_visit')
    if (index % 3 === 0) push('customer_feedback', {
      ratings: { overall: 3 + ((index / 3) % 3), food: 4, hospitality: 5, atmosphere: 4, ordering: 4, reservation: 5, recommendation: [9, 7, 10, 5][index / 3] },
    })
    if (source === 'influencer') push('referral_visit')
    if (index % 6 === 5) continue
    push('menu_view')
    const itemId = campaign.dishes[0]
    push('item_view', { itemId })
    if (index % 4 !== 3) {
      push('quiz_start')
      if (index % 3 !== 2) push('quiz_complete', { preferences: {
        food: index % 3 ? 'vegetarian' : 'traditional', guests: index % 3 ? '2' : '4',
        occasion: index % 3 ? 'casual' : 'gathering', atmosphere: index % 3 ? 'terrace' : 'family',
        spend: index % 3 ? 'light' : 'balanced',
      } })
      push('add_to_cart', { itemId, quantity: 2 })
      if (index % 3 !== 2) {
        push('checkout_start')
        if (index % 5 !== 1) {
          push('order_completed', {
            value: 7400 + (index % 6) * 1800, items: [{ itemId, quantity: 2 }], code: index % 2 ? undefined : 'WELCOME20',
          })
        }
      }
    }
    if (index % 4 === 1 || index % 4 === 2) {
      push('reservation_start')
      push('reservation_completed')
    }
  }
  const sampleOrders = events.filter(({ type }) => type === 'order_completed').sort((a, b) => a.timestamp - b.timestamp)
  const earliest = sampleOrders[0]
  const latest = sampleOrders.at(-1)
  if (earliest && latest && earliest !== latest) {
    events.push({ ...earliest, id: 'sample-loyalty-first', type: 'loyalty_order_points', points: 96, repeat: false })
    events.push({ ...latest, id: 'sample-loyalty-repeat', type: 'loyalty_order_points', points: 85, repeat: true })
    events.push({ ...latest, id: 'sample-loyalty-redemption', type: 'loyalty_reward_redeemed', rewardId: 'aed5', points: 100 })
  }
  return events
}
