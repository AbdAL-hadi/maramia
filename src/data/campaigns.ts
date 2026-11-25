import welcomeImage from '../assets/hero.webp'
import familyImage from '../assets/seating/family.webp'
import businessImage from '../assets/interior.webp'
import mezzeImage from '../assets/menu-hero.webp'
import tasteImage from '../assets/story.webp'
import celebrationImage from '../assets/seating/private.webp'
import type { Localized } from '../types'
import type { Occasion, SeatingZone } from '../types/reservation'
import { reservationLink } from './reservationLinks'
import { dubaiNow } from './reservationTime'

export const campaignCategories = ['welcome', 'dining', 'heritage', 'occasions'] as const
export type CampaignCategory = typeof campaignCategories[number]
export type CampaignAction = 'order' | 'reserve' | 'menu' | 'story' | 'experience'
export type Campaign = {
  id: string
  slug: string
  name: Localized
  description: Localized
  audience: Localized
  category: CampaignCategory
  image: string
  code: string | null
  dishes: readonly string[]
  seating?: SeatingZone
  occasion?: Occasion
  primary: CampaignAction
  secondary: CampaignAction
  starts: string | null
  ends: string | null
  active: boolean
  channel: 'instagram' | 'social' | 'website'
  attribution: string
}

export const campaigns: readonly Campaign[] = [
  {
    id: 'welcome', slug: 'welcome-to-maramia', category: 'welcome', image: welcomeImage, code: 'WELCOME20',
    name: { ar: 'أهلًا بكم في مرامية', en: 'Welcome to Maramia' },
    description: { ar: 'تعرّفوا إلى مائدة مرامية مع الحمّص والمسخّن والكنافة النابلسية، واستخدموا رمز الترحيب في طلبكم التجريبي.', en: 'Get to know the Maramia table with hummus, musakhan, and Nabulsi knafeh. Try the welcome code on your demo order.' },
    audience: { ar: 'للضيوف الذين يجرّبون مرامية لأول مرة', en: 'For guests trying Maramia for the first time' },
    dishes: ['hummus', 'chicken-musakhan', 'nabulsi-knafeh'], primary: 'order', secondary: 'menu',
    starts: null, ends: null, active: true, channel: 'instagram', attribution: 'maramia_launch',
  },
  {
    id: 'family', slug: 'palestinian-family-table', category: 'dining', image: familyImage, code: null,
    name: { ar: 'المائدة العائلية الفلسطينية', en: 'Palestinian Family Table' },
    description: { ar: 'جمّعوا الأهل حول المائدة. قدّموا المقبّلات في الوسط، ثم تقاسموا المسخّن والمفتول الفلسطيني.', en: 'Bring the family together around plates of mezze, musakhan, and Palestinian maftoul. Choose dishes from the menu to build your own shared meal.' },
    audience: { ar: 'للعائلات والمجموعات', en: 'For families and groups' },
    dishes: ['hummus', 'falafel', 'chicken-musakhan', 'palestinian-maftoul'], seating: 'family', occasion: 'gathering', primary: 'reserve', secondary: 'experience',
    starts: null, ends: null, active: true, channel: 'website', attribution: 'maramia_family',
  },
  {
    id: 'business', slug: 'business-lunch', category: 'dining', image: businessImage, code: null,
    name: { ar: 'غداء عمل', en: 'Business Lunch' },
    description: { ar: 'توقّفوا للغداء بين المواعيد، أو اجتمعوا بالزملاء حول الفتّوش وشيش طاووق والقهوة الفلسطينية.', en: 'Make time for lunch between meetings, or bring colleagues together over fattoush, shish tawouk, and Palestinian coffee.' },
    audience: { ar: 'للمهنيين وفرق العمل في الإمارات', en: 'For professionals and teams in the UAE' },
    dishes: ['fattoush', 'shish-tawouk', 'palestinian-coffee'], seating: 'main', occasion: 'business', primary: 'order', secondary: 'reserve',
    starts: null, ends: null, active: true, channel: 'website', attribution: 'maramia_lunch',
  },
  {
    id: 'mezze', slug: 'maramia-mezze-night', category: 'dining', image: mezzeImage, code: 'SALIM10',
    name: { ar: 'أمسية المقبلات في مرامية', en: 'Maramia Mezze Night' },
    description: { ar: 'تشاركوا الحمّص والمتبّل والمقبّلات الساخنة، ثم اختموا المائدة بكأس من شاي الأعشاب.', en: 'Make it a mezze night. Pass around hummus, smoky moutabal, and hot mezze, then stay for a glass of herbal tea.' },
    audience: { ar: 'للأصدقاء ومحبّي الأطباق المشتركة', en: 'For friends and anyone who likes to share' },
    dishes: ['hummus', 'moutabal', 'falafel', 'batata-harra'], seating: 'terrace', occasion: 'casual', primary: 'reserve', secondary: 'experience',
    starts: '2026-11-01', ends: '2027-02-28', active: true, channel: 'social', attribution: 'maramia_mezze',
  },
  {
    id: 'taste', slug: 'taste-of-palestine', category: 'heritage', image: tasteImage, code: null,
    name: { ar: 'نكهة من فلسطين', en: 'Taste of Palestine' },
    description: { ar: 'من خبز الطابون في المسخّن إلى حبات المفتول والكنافة النابلسية، تعرّفوا إلى أطباق المائدة الفلسطينية.', en: 'From the taboon bread in musakhan to Palestinian maftoul and Nabulsi knafeh, discover three dishes and the traditions behind them.' },
    audience: { ar: 'لمحبّي استكشاف المطبخ الفلسطيني', en: 'For guests exploring Palestinian cooking' },
    dishes: ['chicken-musakhan', 'palestinian-maftoul', 'nabulsi-knafeh'], primary: 'menu', secondary: 'story',
    starts: null, ends: null, active: true, channel: 'social', attribution: 'maramia_taste',
  },
  {
    id: 'celebrations', slug: 'celebrations-at-maramia', category: 'occasions', image: celebrationImage, code: null,
    name: { ar: 'احتفالات مرامية', en: 'Celebrations at Maramia' },
    description: { ar: 'اختاروا جلسة للقاء خاص، أو عيد ميلاد، أو ذكرى سنوية، وابدؤوا بتحديد المناسبة في نموذج الحجز.', en: 'Choose a quieter setting for a birthday, anniversary, or private gathering. Start with the occasion and choose a table that fits your group.' },
    audience: { ar: 'للاحتفالات واللقاءات الخاصة', en: 'For celebrations and private gatherings' },
    dishes: ['mixed-grill', 'fattoush', 'nabulsi-knafeh'], seating: 'private', occasion: 'celebration', primary: 'reserve', secondary: 'experience',
    starts: null, ends: null, active: true, channel: 'website', attribution: 'maramia_celebrations',
  },
]

export const featuredCampaignId = 'welcome'
export const seasonalCampaignId = 'mezze'

export const referrals = {
  MIRA10: { campaignId: 'welcome', source: 'instagram', medium: 'influencer' },
  SALIM10: { campaignId: 'mezze', source: 'instagram', medium: 'influencer' },
  UAEWELCOME: { campaignId: 'welcome', source: 'website', medium: 'referral' },
} as const

export type ReferralCode = keyof typeof referrals
export type CampaignStatus = 'active' | 'scheduled' | 'expired' | 'inactive'

export function findCampaign(id: string | null) {
  return campaigns.find((campaign) => campaign.id === id)
}

export function campaignStatus(campaign: Campaign, date = dubaiNow().date): CampaignStatus {
  if (!campaign.active) return 'inactive'
  if (campaign.starts && date < campaign.starts) return 'scheduled'
  if (campaign.ends && date > campaign.ends) return 'expired'
  return 'active'
}

export function promotionCampaign(code: string) {
  return campaigns.find((campaign) => campaign.code === code)
    ?? (Object.hasOwn(referrals, code) ? findCampaign(referrals[code as ReferralCode].campaignId) : undefined)
}

export function resolveReferral(value: string | null, date?: string) {
  const code = value?.trim().toUpperCase()
  if (!code || !Object.hasOwn(referrals, code)) return null
  const referral = referrals[code as ReferralCode]
  const campaign = findCampaign(referral.campaignId)
  if (!campaign || campaignStatus(campaign, date) !== 'active') return null
  return { code: code as ReferralCode, campaign, ...referral }
}

export function campaignPath(campaign: Campaign) {
  return '/offers/' + campaign.slug
}

export function referralPath(code: ReferralCode) {
  const referral = referrals[code]
  const campaign = findCampaign(referral.campaignId)
  if (!campaign) return '/offers'
  const query = new URLSearchParams({
    utm_source: referral.source, utm_medium: referral.medium, utm_campaign: campaign.attribution, ref: code,
  })
  return campaignPath(campaign) + '?' + query.toString()
}

export function campaignActionPath(campaign: Campaign, action: CampaignAction, code = campaign.code) {
  switch (action) {
    case 'order':
      return code ? '/order?offer=' + encodeURIComponent(code) : '/order'
    case 'reserve':
      return reservationLink(campaign.seating, campaign.occasion)
    case 'story':
      return '/about'
    case 'experience':
      return '/uae#dining-experiences'
    default:
      return '/menu'
  }
}
