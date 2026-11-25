import { readStorage, writeStorage } from '../hooks/storage'
import { campaignStatus, campaigns, findCampaign, promotionCampaign, referrals, resolveReferral, type ReferralCode } from './campaigns'
import { menuCatalog } from './menu'
import { quizFields, quizOption, type MarketingPreferences } from './marketingPreferences'
import { promotions } from './ordering'
import { occasions } from './reservations'
import { cleanRatings, type FeedbackRatings } from './customerFeedback'
import { maxTransactionPoints, rewardById, tierIds, type TierId } from './loyalty'

export const analyticsKey = 'maramia.analytics.v1'
export const analyticsChanged = 'maramia:analytics'
const sessionKey = 'maramia.marketing-session.v1'
const maxEvents = 1500

export const sources = ['direct', 'instagram', 'influencer', 'other', 'facebook', 'tiktok', 'whatsapp', 'print'] as const
export type AcquisitionSource = typeof sources[number]
export const workspaceEvents = ['graphic_generated', 'campaign_link_generated', 'qr_generated'] as const
const eventTypes = [
  'session_visit', 'home_view', 'menu_view', 'campaign_impression', 'campaign_visit', 'campaign_click', 'referral_visit',
  'item_view', 'add_to_cart', 'checkout_start', 'order_completed', 'reservation_start', 'reservation_completed',
  'quiz_start', 'quiz_complete', 'promo_redeemed', 'newsletter_submit', 'share',
  'loyalty_view', 'loyalty_join', 'loyalty_welcome', 'loyalty_order_points', 'loyalty_visit_points',
  'loyalty_reward_selected', 'loyalty_reward_redeemed', 'loyalty_tier_upgrade', 'loyalty_repeat_order',
  ...workspaceEvents, 'gift_preview', 'gift_generated', 'customer_feedback',
] as const
export type EventType = typeof eventTypes[number]
type ShareMethod = 'native' | 'copy' | 'whatsapp' | 'print'
type OrderedItem = { itemId: string; quantity: number }

export type MarketingEvent = {
  id: string
  type: EventType
  timestamp: number
  sessionId: string
  campaignId?: string
  source: AcquisitionSource
  referral?: ReferralCode
  itemId?: string
  quantity?: number
  value?: number
  reference?: string
  code?: string
  items?: OrderedItem[]
  preferences?: MarketingPreferences
  method?: ShareMethod
  points?: number
  tier?: TierId
  rewardId?: string
  repeat?: boolean
  ratings?: FeedbackRatings
}

type EventDetails = Omit<Partial<MarketingEvent>, 'id' | 'type' | 'timestamp' | 'sessionId'>
export type EventAttribution = Pick<MarketingEvent, 'source' | 'campaignId' | 'referral'>

type Session = Pick<MarketingEvent, 'sessionId' | 'campaignId' | 'source' | 'referral'> & {
  suggestedCode?: string
}

let memorySession: Session | undefined
let documentVisitId: string | undefined
const menuIds = new Set(menuCatalog.map(({ id }) => id))

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function id() {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), (n) => n.toString(16).padStart(2, '0')).join('')
}

function member<T extends string>(options: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && options.includes(value as T)
}

function integer(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max
}

function knownCampaign(value: unknown): value is string {
  return typeof value === 'string' && Boolean(findCampaign(value))
}

function knownReferral(value: unknown): value is ReferralCode {
  return typeof value === 'string' && Object.hasOwn(referrals, value)
}

function knownItem(value: unknown): value is string {
  return typeof value === 'string' && menuIds.has(value)
}

function knownCode(value: unknown): value is string {
  return typeof value === 'string' && Object.hasOwn(promotions, value)
}

function localSessionId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{24}$/.test(value)
}

function preferenceValues(input: unknown) {
  const entry = object(input)
  const preferences: Record<string, string> = {}
  for (const key of quizFields) {
    const value = entry[key]
    if (typeof value === 'string' && quizOption(key, value)) preferences[key] = value
  }
  if (member(occasions, entry.newsletterOccasion)) preferences.newsletterOccasion = entry.newsletterOccasion
  return preferences as MarketingPreferences
}

function cleanEvent(value: unknown): MarketingEvent | null {
  const entry = object(value)
  if (typeof entry.id !== 'string' || !/^[a-zA-Z0-9:_-]{1,100}$/.test(entry.id)) return null
  if (!member(eventTypes, entry.type) || !localSessionId(entry.sessionId) || !member(sources, entry.source)
    || !integer(entry.timestamp, 0, 8_640_000_000_000_000)) return null
  const event: MarketingEvent = { id: entry.id, type: entry.type, sessionId: entry.sessionId, source: entry.source, timestamp: entry.timestamp }
  if (knownCampaign(entry.campaignId)) event.campaignId = entry.campaignId
  if (knownReferral(entry.referral)) event.referral = entry.referral
  if (knownItem(entry.itemId)) event.itemId = entry.itemId
  if (integer(entry.quantity, 1, 1500)) event.quantity = entry.quantity
  if (integer(entry.value, 0, 100_000_000)) event.value = entry.value
  if (typeof entry.reference === 'string' && /^MRA-(?:[A-F0-9]{10}|R-[A-F0-9]{12})$/.test(entry.reference)) event.reference = entry.reference
  if (knownCode(entry.code)) event.code = entry.code
  if (integer(entry.points, 0, maxTransactionPoints)) event.points = entry.points
  if (member(tierIds, entry.tier)) event.tier = entry.tier
  const reward = rewardById(entry.rewardId)
  if (reward) event.rewardId = reward.id
  if (typeof entry.repeat === 'boolean') event.repeat = entry.repeat
  if (entry.type === 'customer_feedback') {
    const ratings = cleanRatings(entry.ratings)
    if (!Object.keys(ratings).length) return null
    event.ratings = ratings
  }
  if (Array.isArray(entry.items)) {
    event.items = entry.items.slice(0, 75).flatMap((value) => {
      const item = object(value)
      return knownItem(item.itemId) && integer(item.quantity, 1, 1500) ? [{ itemId: item.itemId, quantity: item.quantity }] : []
    })
  }
  if (entry.preferences) event.preferences = preferenceValues(entry.preferences)
  if (member(['native', 'copy', 'whatsapp', 'print'], entry.method)) event.method = entry.method
  return event
}

export function readAnalytics() {
  const stored = object(readStorage(analyticsKey, null))
  if (stored.version !== 1 || !Array.isArray(stored.events)) return []
  const unique = new Map<string, MarketingEvent>()
  for (const candidate of stored.events.slice(-maxEvents)) {
    const event = cleanEvent(candidate)
    if (event && !unique.has(event.id)) unique.set(event.id, event)
  }
  return [...unique.values()]
}

function writeAnalytics(events: MarketingEvent[]) {
  const saved = writeStorage(analyticsKey, { version: 1, events: events.slice(-maxEvents) })
  if (saved) window.dispatchEvent(new Event(analyticsChanged))
  return saved
}

async function withAnalyticsLock(write: () => boolean) {
  try {
    return navigator.locks ? await navigator.locks.request(analyticsKey, write) : write()
  } catch {
    return false
  }
}

export async function resetAnalytics() {
  const saved = await withAnalyticsLock(() => writeAnalytics([]))
  if (saved) {
    memorySession = undefined
    try {
      sessionStorage.removeItem(sessionKey)
    } catch {
      // The in-memory session has already been cleared.
    }
  }
  return saved
}

function session(): Session {
  if (memorySession) return memorySession
  try {
    const entry = object(JSON.parse(sessionStorage.getItem(sessionKey) ?? 'null'))
    if (localSessionId(entry.sessionId) && member(sources, entry.source)) {
      memorySession = { sessionId: entry.sessionId, source: entry.source }
      if (knownCampaign(entry.campaignId)) memorySession.campaignId = entry.campaignId
      if (knownReferral(entry.referral)) memorySession.referral = entry.referral
      if (knownCode(entry.suggestedCode)) memorySession.suggestedCode = entry.suggestedCode
      return memorySession
    }
  } catch {
    // A tab can still run the demo when session storage is unavailable.
  }
  memorySession = { sessionId: id(), source: 'direct' }
  saveSession(memorySession)
  return memorySession
}

function saveSession(next: Session) {
  memorySession = next
  try {
    sessionStorage.setItem(sessionKey, JSON.stringify(next))
  } catch {
    // Keep the current tab's attribution in memory.
  }
}

export function recordEvent(type: EventType, details: EventDetails = {}, once?: string) {
  const { sessionId, campaignId, source, referral } = session()
  const event = cleanEvent({
    sessionId, campaignId, source, referral, ...details, type, timestamp: Date.now(),
    id: once ? type + ':' + once : id(),
  })
  if (!event) return Promise.resolve(false)
  return withAnalyticsLock(() => {
    const events = readAnalytics()
    if (events.some(({ id }) => id === event.id)) return true
    return writeAnalytics([...events, event])
  })
}

export function readEventAttribution(value: unknown): EventAttribution | undefined {
  const entry = object(value)
  if (!member(sources, entry.source)) return
  return {
    source: entry.source,
    campaignId: knownCampaign(entry.campaignId) ? entry.campaignId : undefined,
    referral: knownReferral(entry.referral) ? entry.referral : undefined,
  }
}

export function currentEventAttribution(): EventAttribution {
  const { source, campaignId, referral } = session()
  return { source, campaignId, referral }
}

export function recordOnceInSession(type: EventType, details: EventDetails, key: string) {
  return recordEvent(type, details, session().sessionId + ':' + key)
}

export function suggestedPromotion() {
  const code = session().suggestedCode
  const campaign = code && promotionCampaign(code)
  return code && campaign && campaignStatus(campaign) === 'active' ? code : ''
}

export function observeCustomerRoute(path: string, params: URLSearchParams, visitKey: string, enteredPage: boolean) {
  const previous = session()
  const navigationId = previous.sessionId + ':' + (documentVisitId ??= id()) + ':' + visitKey
  const slug = path.match(/^\/offers\/([^/]+)$/)?.[1]
  const landing = campaigns.find((campaign) => campaign.slug === slug)
  const canUseTags = !slug || slug === 'table-quiz'
  const referral = resolveReferral(params.get('ref'))
  const accepted = referral && (canUseTags || landing?.id === referral.campaign.id) ? referral : null
  const tagged = campaigns.find((campaign) => campaign.attribution === params.get('utm_id'))
    ?? campaigns.find((campaign) => campaign.attribution === params.get('utm_campaign'))
  const rawCode = params.get('offer')?.trim().toUpperCase()
  const offer = path === '/order' && knownCode(rawCode) ? rawCode : undefined
  const codeCampaign = offer ? promotionCampaign(offer) : undefined
  const target = landing ?? (canUseTags ? accepted?.campaign ?? tagged ?? codeCampaign : undefined)
  const active = target && campaignStatus(target) === 'active'
  const sourceTag = params.get('utm_source')?.trim().toLowerCase()
  const mediumTag = params.get('utm_medium')?.trim().toLowerCase()
  const taggedMedium = tagged && member(['influencer', 'referral', 'social', 'paid-social', 'print', 'messaging', 'direct'], mediumTag)
  const source: AcquisitionSource = accepted?.medium === 'influencer'
    ? 'influencer' : member(sources, sourceTag) ? sourceTag : sourceTag || accepted || taggedMedium ? 'other' : 'direct'
  if (active && target && (target.id !== previous.campaignId || accepted || sourceTag || taggedMedium || (offer && offer !== previous.suggestedCode))) {
    const retain = target.id === previous.campaignId && !sourceTag && !accepted && !taggedMedium
    saveSession({
      sessionId: previous.sessionId,
      campaignId: target.id,
      source: retain ? previous.source : source,
      referral: accepted?.code ?? (retain ? previous.referral : undefined),
      suggestedCode: accepted?.code ?? (retain && previous.referral ? previous.suggestedCode : offer ?? target.code ?? undefined),
    })
  } else if (!previous.campaignId && source !== 'direct') {
    saveSession({ ...previous, source })
  }
  void recordOnceInSession('session_visit', {}, 'entry')
  if (accepted && active) void recordOnceInSession('referral_visit', { campaignId: target.id, referral: accepted.code }, accepted.code)
  const visit = landing ?? (active && enteredPage && (tagged || accepted) ? target : undefined)
  if (visit) void recordEvent('campaign_visit', {
    campaignId: visit.id,
    source: active ? session().source : source,
    referral: active ? session().referral : undefined,
  }, navigationId + ':' + visit.id)
  if (path === '/' && enteredPage) void recordEvent('home_view', {}, navigationId)
  if (path === '/menu') {
    if (enteredPage) void recordEvent('menu_view', {}, navigationId)
    const item = menuCatalog.find((dish) => dish.available && dish.slug === params.get('dish'))
    if (item) void recordEvent('item_view', { itemId: item.id }, navigationId + ':' + item.id)
  }
  if (path === '/reservation' && enteredPage) void recordEvent('reservation_start', {}, navigationId)
  if (path === '/loyalty' && enteredPage) void recordEvent('loyalty_view', {}, navigationId)
}
