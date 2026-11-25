import { readStorage, withStorageLock, writeStorage } from '../hooks/storage'
import type { Localized } from '../types'
import { campaignPath, findCampaign, referrals, resolveReferral, type ReferralCode } from './campaigns'
import { menuCatalog } from './menu'
import { dishLink } from './menuFilters'
import { publicCampaignUrl } from './restaurant'

export const linkSources = {
  instagram: { ar: 'إنستغرام', en: 'Instagram' },
  facebook: { ar: 'فيسبوك', en: 'Facebook' },
  tiktok: { ar: 'تيك توك', en: 'TikTok' },
  whatsapp: { ar: 'واتساب', en: 'WhatsApp' },
  influencer: { ar: 'شراكة تسويقية', en: 'Influencer Campaign' },
  print: { ar: 'إعلان مطبوع', en: 'Printed Advertisement' },
  direct: { ar: 'حملة مباشرة', en: 'Direct Campaign' },
} satisfies Record<string, Localized>

export const linkMedia = {
  social: { ar: 'التواصل الاجتماعي', en: 'Organic Social' },
  'paid-social': { ar: 'إعلان مدفوع', en: 'Paid Social' },
  influencer: { ar: 'شراكة', en: 'Partnership' },
  referral: { ar: 'إحالة', en: 'Referral' },
  messaging: { ar: 'رسائل', en: 'Messaging' },
  print: { ar: 'مطبوعات', en: 'Print' },
  direct: { ar: 'مباشر', en: 'Direct' },
} satisfies Record<string, Localized>

export const referralLabels: Record<ReferralCode, Localized> = {
  MIRA10: { ar: 'رابط شريك الترحيب', en: 'Welcome Partner Link' },
  SALIM10: { ar: 'رابط شريك أمسية المقبّلات', en: 'Mezze Night Partner Link' },
  UAEWELCOME: { ar: 'رابط الترحيب في الإمارات', en: 'UAE Welcome Link' },
}

export const siteDestinations = {
  home: { path: '/', label: { ar: 'الصفحة الرئيسية', en: 'Restaurant Homepage' } },
  menu: { path: '/menu', label: { ar: 'القائمة الرقمية', en: 'Digital Menu' } },
  dish: { path: '/menu', label: { ar: 'طبق محدد', en: 'Specific Menu Item' } },
  reserve: { path: '/reservation', label: { ar: 'حجز طاولة', en: 'Table Reservations' } },
  campaign: { path: '/offers', label: { ar: 'صفحة الحملة', en: 'Campaign Landing Page' } },
  rewards: { path: '/loyalty', label: { ar: 'مكافآت ميرمية', en: 'Maramia Rewards' } },
  gifts: { path: '/gift-cards', label: { ar: 'بطاقات الهدايا', en: 'Gift Cards' } },
  restaurant: { path: '/uae', label: { ar: 'المطعم والجولة', en: 'Restaurant and Tour' } },
} as const

export type Destination = keyof typeof siteDestinations
export type LinkConfig = {
  destination: Destination; campaign: string; dish: string; source: keyof typeof linkSources
  medium: keyof typeof linkMedia; name: string; referral: ReferralCode | ''
}

export const defaultLinkConfig: LinkConfig = {
  destination: 'campaign', campaign: 'welcome', dish: 'hummus',
  source: 'instagram', medium: 'paid-social', name: 'maramia_launch', referral: '',
}

export function campaignTag(value: string) {
  return value.normalize('NFKC').trim().toLowerCase().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^[-_]+|[-_]+$/g, '').slice(0, 72)
}

export function destinationPath(destination: Destination, campaignId: string, dishSlug: string) {
  const campaign = findCampaign(campaignId)
  if (destination === 'campaign') return campaign ? campaignPath(campaign) : siteDestinations.campaign.path
  if (destination === 'dish' && menuCatalog.some((item) => item.available && item.slug === dishSlug)) {
    const path = dishLink(dishSlug)
    return path.pathname + path.search
  }
  return siteDestinations[destination].path
}

export function campaignTrackingUrl(config: LinkConfig) {
  if (config.name.includes('@')) return null
  const campaign = findCampaign(config.campaign)
  const referral = resolveReferral(config.referral)
  if (config.referral && (!referral || (campaign && referral.campaign.id !== campaign.id))) return null
  const name = campaignTag(config.name) || campaign?.attribution || referral?.campaign.attribution
  if (!name) return null
  const selected = campaign ?? referral?.campaign
  const url = new URL(publicCampaignUrl(destinationPath(config.destination, selected?.id ?? '', config.dish)))
  url.searchParams.set('utm_source', config.source)
  url.searchParams.set('utm_medium', config.medium)
  url.searchParams.set('utm_campaign', name)
  if (selected) url.searchParams.set('utm_id', selected.attribution)
  if (referral) url.searchParams.set('ref', referral.code)
  return url.href
}

export function validPublicLink(input: string) {
  const value = input.trim()
  if (value.length > 1200) return null
  try {
    const url = new URL(value, publicCampaignUrl('/'))
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || !/^(https?:\/\/|\/(?!\/))/i.test(value)) return null
    return url.href.length <= 1200 ? url.href : null
  } catch {
    return null
  }
}

export function isLoopback(url: string) {
  const host = new URL(url).hostname.toLowerCase()
  return host === 'localhost' || host.endsWith('.localhost') || host.startsWith('127.') || host === '[::1]'
}

const savedLinksKey = 'maramia.campaign-links.v1'

function hasKey<T extends object>(collection: T, key: unknown): key is keyof T & string {
  return typeof key === 'string' && Object.hasOwn(collection, key)
}

export function loadSavedLinks(): LinkConfig[] {
  const record = readStorage<{ version?: number; links?: unknown } | null>(savedLinksKey, null)
  if (record?.version !== 1 || !Array.isArray(record.links)) return []
  return record.links.slice(0, 12).flatMap((line: unknown) => {
    if (!line || typeof line !== 'object') return []
    const { destination, campaign, dish, source, medium, name, referral } = line as Record<string, unknown>
    if (!hasKey(siteDestinations, destination) || !hasKey(linkSources, source) || !hasKey(linkMedia, medium)
      || typeof name !== 'string' || !(referral === '' || hasKey(referrals, referral))) return []
    return [{
      destination, source, medium, referral, name: campaignTag(name),
      campaign: typeof campaign === 'string' && findCampaign(campaign) ? campaign : '',
      dish: typeof dish === 'string' && menuCatalog.some((item) => item.slug === dish) ? dish : defaultLinkConfig.dish,
    }]
  })
}

export function saveLinkConfiguration(config: LinkConfig) {
  const safe = { ...config, name: campaignTag(config.name) }
  return withStorageLock(savedLinksKey, () => {
    const existing = loadSavedLinks().filter((item) => JSON.stringify(item) !== JSON.stringify(safe))
    return writeStorage(savedLinksKey, { version: 1, links: [safe, ...existing].slice(0, 12) })
  })
}
