import { useEffect, useRef } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { campaignActionPath, campaignPath, campaignStatus, type Campaign, type CampaignAction } from '../../data/campaigns'
import { recordEvent, recordOnceInSession } from '../../data/marketingAnalytics'
import { menuCatalog } from '../../data/menu'
import { aedCurrency, dishLink } from '../../data/menuFilters'
import { promotions } from '../../data/ordering'
import { dateLabel } from '../../data/reservationTime'
import type { CopyKey } from '../../i18n/copy'
import { campaignStatusCopy } from '../../i18n/marketing'
import { DishMedia } from '../menu/DishMedia'

export function useCampaignImpression(campaign: Campaign | undefined) {
  const marker = useRef<HTMLElement>(null)
  const id = campaign?.id
  useEffect(() => {
    const element = marker.current
    if (!element || !id) return
    const seen = () => { void recordOnceInSession('campaign_impression', { campaignId: id }, id) }
    if (!('IntersectionObserver' in window)) {
      seen()
      return
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        seen()
        observer.disconnect()
      }
    }, { threshold: 0.2 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [id])
  return marker
}

export function CampaignLink({ campaign, ...props }: LinkProps & { campaign: Campaign }) {
  return <Link {...props} onClick={(event) => {
    props.onClick?.(event)
    if (!event.defaultPrevented) void recordEvent('campaign_click', { campaignId: campaign.id })
  }} />
}

const actionLabel: Record<CampaignAction, CopyKey> = {
  order: 'order', reserve: 'reserve', menu: 'exploreMenu', experience: 'discoverRestaurant', story: 'story',
}

export function CampaignActionLink({ campaign, action, code, className }: {
  campaign: Campaign; action: CampaignAction; code?: string; className: string
}) {
  const { t } = useLanguage()
  return <CampaignLink campaign={campaign} to={campaignActionPath(campaign, action, code)} className={className}>{t(actionLabel[action])}</CampaignLink>
}

export function CampaignActions({ campaign, code }: { campaign: Campaign; code?: string }) {
  return (
    <div className="editorial-actions">
      {[campaign.primary, campaign.secondary].map((action, index) => (
        <CampaignActionLink key={action} campaign={campaign} action={action} code={code}
          className={'button ' + (index ? 'button--line' : 'button--forest')} />
      ))}
    </div>
  )
}

export function CampaignOffer({ campaign, code = campaign.code }: { campaign: Campaign; code?: string | null }) {
  const { language, t } = useLanguage()
  const promotion = code && Object.hasOwn(promotions, code) ? promotions[code] : null
  if (!promotion || !code || !promotion.active || campaignStatus(campaign) !== 'active') return null
  const value = promotion.kind === 'percent' ? promotion.value.toLocaleString(language === 'ar' ? 'ar-AE' : 'en-AE') : aedCurrency[language].format(promotion.value / 100)
  return (
    <p className="campaign-offer">
      <span>{t(promotion.kind === 'percent' ? 'campaignPercent' : 'campaignFixed').replace('{value}', value)}</span>
      <bdi>{code}</bdi>
      {promotion.minimum > 0 && <small>{t('campaignCodeMinimum').replace('{value}', aedCurrency[language].format(promotion.minimum / 100))}</small>}
    </p>
  )
}

export function CampaignDates({ campaign }: { campaign: Campaign }) {
  const { language, t } = useLanguage()
  if (!campaign.starts && !campaign.ends) return null
  return <p className="campaign-dates" aria-label={t('campaignDates')}>
    {campaign.starts && <span>{t('campaignStarts').replace('{date}', dateLabel(campaign.starts, language, { dateStyle: 'medium' }))}</span>}
    {campaign.ends && <span>{t('campaignEnds').replace('{date}', dateLabel(campaign.ends, language, { dateStyle: 'medium' }))}</span>}
  </p>
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { t, language } = useLanguage()
  const ref = useCampaignImpression(campaign)
  const status = campaignStatus(campaign)
  return (
    <article className="campaign-card" data-campaign={campaign.id} ref={ref} aria-labelledby={'campaign-card-' + campaign.id}>
      <img className="campaign-card-image" src={campaign.image} alt="" loading="lazy" decoding="async" />
      <div className="campaign-card-content">
        {status !== 'active' && <p className="campaign-status">{campaignStatusCopy[status][language]}</p>}
        <h3 id={'campaign-card-' + campaign.id}>{campaign.name[language]}</h3>
        <p>{campaign.description[language]}</p>
        <CampaignOffer campaign={campaign} />
        <CampaignLink className="button button--line" to={campaignPath(campaign)} campaign={campaign}>{t('campaignDetails')}</CampaignLink>
      </div>
    </article>
  )
}

export function CampaignDishes({ campaign }: { campaign: Campaign }) {
  const { t, language } = useLanguage()
  return (
    <section className="editorial-section campaign-dish-section" aria-labelledby="campaign-dishes-title">
      <div className="container">
        <div className="editorial-heading"><h2 id="campaign-dishes-title">{t('recommendedDishes')}</h2></div>
        <ul className="campaign-dishes" role="list">
          {campaign.dishes.map((id) => {
            const item = menuCatalog.find((dish) => dish.id === id && dish.available)
            if (!item) return null
            return <li key={id}>
              <CampaignLink to={dishLink(item.slug)} campaign={campaign}>
                <DishMedia item={item} className="food-story-image" />
                <span>{language === 'ar' ? item.nameAr : item.nameEn}</span>
                <bdi>{aedCurrency[language].format(item.priceAED)}</bdi>
              </CampaignLink>
            </li>
          })}
        </ul>
      </div>
    </section>
  )
}
