import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { campaigns } from '../data/campaigns'
import { menuCatalog } from '../data/menu'
import { publicCampaignUrl } from '../data/restaurant'
import type { CopyKey } from '../i18n/copy'

const pages: Record<string, readonly [CopyKey, CopyKey]> = {
  '/menu': ['menuPageTitle', 'menuIntro'],
  '/about': ['story', 'aboutIntro'],
  '/uae': ['uae', 'restaurantIntro'],
  '/offers': ['offers', 'offersIntro'],
  '/offers/table-quiz': ['quizTitle', 'quizIntro'],
  '/order': ['orderHeading', 'orderIntro'],
  '/reservation': ['reservationHeading', 'reservationIntro'],
  '/reservation/manage': ['reservationManage', 'reservationIntro'],
  '/loyalty': ['rewardsName', 'rewardsIntro'],
  '/gift-cards': ['giftTitle', 'giftIntro'],
  '/feedback': ['feedbackTitle', 'feedbackIntro'],
  '/contact': ['contact', 'reachIntro'],
  '/faq': ['faqTitle', 'faqIntro'],
  '/marketing': ['marketingTitle', 'marketingIntro'],
  '/marketing/studio': ['studioTitle', 'studioIntro'],
  '/marketing/links': ['linksTitle', 'linksIntro'],
  '/marketing/qr': ['qrTitle', 'qrIntro'],
}

function pageCopy(path: string): readonly [CopyKey, CopyKey] {
  if (Object.hasOwn(pages, path)) return pages[path]
  if (/^\/order\/[^/]+\/track$/.test(path)) return ['trackingHeading', 'trackingIntro']
  if (/^\/order\/[^/]+$/.test(path)) return ['confirmation', 'confirmationText']
  if (/^\/reservation\/[^/]+\/edit$/.test(path)) return ['reservationEditHeading', 'reservationIntro']
  if (/^\/reservation\/[^/]+$/.test(path)) return ['reservationDetails', 'reservationIntro']
  if (/^\/offers\/[^/]+$/.test(path)) return ['campaignMissing', 'offersIntro']
  return ['missing', 'placeholder']
}

export function PageMetadata() {
  const { language, t } = useLanguage()
  const { pathname, search } = useLocation()
  const path = pathname.replace(/\/+$/, '') || '/'
  const campaign = campaigns.find(({ slug }) => path === '/offers/' + slug)
  const slug = path === '/menu' ? new URLSearchParams(search).get('dish') : null
  const dish = slug ? menuCatalog.find((item) => item.available && item.slug === slug) : undefined
  const [titleKey, descriptionKey] = pageCopy(path)
  const brand = language === 'ar' ? 'مرامية الإمارات' : 'Maramia UAE'
  const page = campaign?.name[language] ?? (language === 'ar' ? dish?.nameAr : dish?.nameEn) ?? t(titleKey)
  const title = path === '/' ? brand : `${page} | ${brand}`
  const description = campaign?.description[language] ?? (language === 'ar' ? dish?.descriptionAr : dish?.descriptionEn)
    ?? t(path === '/' ? 'metaHome' : descriptionKey)

  useLayoutEffect(() => {
    document.title = title
    const updates = {
      'name="description"': description,
      'property="og:title"': title,
      'property="og:description"': description,
      'property="og:image"': publicCampaignUrl('/maramia-share.jpg'),
      'property="og:locale"': language === 'ar' ? 'ar_AE' : 'en_AE',
      'property="og:locale:alternate"': language === 'ar' ? 'en_AE' : 'ar_AE',
      'property="og:image:alt"': t('metaImage'),
    }
    for (const [attribute, value] of Object.entries(updates)) {
      document.head.querySelector<HTMLMetaElement>(`meta[${attribute}]`)?.setAttribute('content', value)
    }
  }, [title, description, language, t])
  return null
}
