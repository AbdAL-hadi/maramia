import { Link } from 'react-router-dom'
import { SageSprig } from '../components/Brand'
import { Reveal } from '../components/Reveal'
import { SignupForm } from '../components/SignupForm'
import { CampaignLink, CampaignOffer, useCampaignImpression } from '../components/marketing/CampaignContent'
import { useLanguage } from '../context/LanguageContext'
import { campaignPath, campaignStatus, featuredCampaignId, findCampaign } from '../data/campaigns'

export function DiningOffers() {
  const { t, language } = useLanguage()
  const featured = findCampaign(featuredCampaignId)
  const campaign = featured && campaignStatus(featured) === 'active' ? featured : undefined
  const marker = useCampaignImpression(campaign)
  return (
    <section id="offers" className="opening section-space" aria-labelledby="dining-offers-title" tabIndex={-1} ref={marker}>
      <SageSprig className="opening-sprig" />
      <div className="container opening-grid">
        <Reveal>
          <p className="eyebrow">{t('diningOffers')}</p>
          <h2 id="dining-offers-title">{campaign ? campaign.name[language] : t('diningTitle')}</h2>
          <p className="section-text">{campaign ? campaign.description[language] : t('diningText')}</p>
          {campaign && <CampaignOffer campaign={campaign} />}
          <div className="editorial-actions home-offer-actions">
            {campaign && <CampaignLink to={campaignPath(campaign)} campaign={campaign} className="button button--forest">{t('campaignDetails')}</CampaignLink>}
            <Link to="/offers" className="button button--line">{t('viewCampaigns')}</Link>
            <Link to="/offers/table-quiz" className="button button--line">{t('quizTitle')}</Link>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <SignupForm mode="opening" campaignId={campaign?.id} />
        </Reveal>
      </div>
    </section>
  )
}
