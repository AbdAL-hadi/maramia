import { useState } from 'react'
import { Link } from 'react-router-dom'
import banner from '../assets/menu-hero.webp'
import { EditorialHero } from '../components/experience/EditorialHero'
import { CampaignCard, CampaignDates, CampaignLink, CampaignOffer, useCampaignImpression } from '../components/marketing/CampaignContent'
import { PromoBanner } from '../components/order/OrderPromotions'
import { SignupForm } from '../components/SignupForm'
import { useLanguage } from '../context/LanguageContext'
import { diningExperiences } from '../data/brandExperience'
import { referralLabels } from '../data/marketingTools'
import { campaignCategories, campaignPath, campaigns, campaignStatus, featuredCampaignId, findCampaign, referralPath, referrals, resolveReferral, seasonalCampaignId, type Campaign, type CampaignCategory, type ReferralCode } from '../data/campaigns'
import { campaignCategoriesCopy, campaignStatusCopy } from '../i18n/marketing'
import '../styles/hospitality.css'

const referralCodes = Object.keys(referrals) as ReferralCode[]

function FeaturedOffer({ campaign }: { campaign: Campaign }) {
  const { language, t } = useLanguage()
  const marker = useCampaignImpression(campaign)
  return <section ref={marker} className="editorial-section offers-feature" aria-labelledby="featured-offer-title">
    <div className="container editorial-split">
      <div className="editorial-copy">
        <p className="eyebrow">{t('campaignFeatured')}</p>
        <h2 id="featured-offer-title">{campaign.name[language]}</h2>
        <p className="section-text">{campaign.description[language]}</p>
        <CampaignOffer campaign={campaign} />
        <CampaignLink to={campaignPath(campaign)} className="button button--forest" campaign={campaign}>{t('campaignDetails')}</CampaignLink>
      </div>
      <div className="editorial-frame editorial-frame--arched"><img src={campaign.image} alt="" loading="lazy" /></div>
    </div>
  </section>
}

export default function OffersPage() {
  const { language, t } = useLanguage()
  const [category, setCategory] = useState<CampaignCategory | ''>('')
  const featured = findCampaign(featuredCampaignId)
  const seasonal = findCampaign(seasonalCampaignId)
  const cards = campaigns.filter((campaign) => !category || campaign.category === category)
  return <div className="editorial-page offers-page">
    <EditorialHero variant="story" image={banner} label={t('offers')} title={t('offersHeadline')} intro={t('offersIntro')}>
      <Link className="button button--gold" to="#campaigns">{t('viewCampaigns')}</Link>
      <Link className="button button--outline" to="/offers/table-quiz">{t('quizTitle')}</Link>
    </EditorialHero>
    {featured && campaignStatus(featured) === 'active' && <FeaturedOffer campaign={featured} />}

    <section className="editorial-section offers-list" id="campaigns" tabIndex={-1} aria-labelledby="offers-list-title">
      <div className="container">
        <div className="editorial-heading"><h2 id="offers-list-title">{t('campaignAvailable')}</h2></div>
        <div className="campaign-filters" role="group" aria-label={t('campaignCategories')}>
          <button type="button" aria-pressed={!category} onClick={() => setCategory('')}>{t('allCampaigns')}</button>
          {campaignCategories.map((item) => <button type="button" key={item} aria-pressed={item === category} onClick={() => setCategory(item)}>{campaignCategoriesCopy[item][language]}</button>)}
        </div>
        {cards.length ? <div className="campaign-grid">{cards.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}</div>
          : <p role="status">{t('noCampaigns')}</p>}
      </div>
    </section>

    {seasonal && <section className="editorial-section offers-season" aria-labelledby="seasonal-title">
      <div className="container editorial-split">
        <div className="editorial-frame"><img src={seasonal.image} alt="" loading="lazy" /></div>
        <div className="editorial-copy">
          <p className="eyebrow">{t('campaignSeasonal')}</p>
          <h2 id="seasonal-title">{seasonal.name[language]}</h2>
          <p className="section-text">{seasonal.description[language]}</p>
          <p className="campaign-status">{campaignStatusCopy[campaignStatus(seasonal)][language]}</p>
          <CampaignDates campaign={seasonal} />
          <CampaignLink to={campaignPath(seasonal)} campaign={seasonal} className="button button--line">{t('campaignDetails')}</CampaignLink>
        </div>
      </div>
    </section>}

    <section className="editorial-section offers-next" aria-labelledby="offers-next-title">
      <div className="container offers-next-grid">
        <div>
          <h2 id="offers-next-title">{t('campaignCollections')}</h2>
          <p>{t('campaignCollectionsText')}</p>
          <ul className="offer-collection-links" role="list">
            {diningExperiences.map((experience) => <li key={experience.id}>
              <Link to={'/uae#collection-' + experience.id}>{experience.title[language]}</Link>
            </li>)}
          </ul>
          <div className="editorial-actions">
            <Link className="button button--forest" to="/uae#dining-experiences">{t('diningExperiences')}</Link>
            <Link className="button button--line" to="/offers/table-quiz">{t('quizTitle')}</Link>
          </div>
        </div>
        <div>
          <h3>{t('campaignCode')}</h3>
          <PromoBanner />
          <h3>{t('campaignReferralTitle')}</h3>
          <p>{t('campaignReferralNote')}</p>
          <ul className="referral-list" role="list">{referralCodes.filter((code) => resolveReferral(code)).map((code) => {
            const referral = resolveReferral(code)
            return referral && <li key={code}><CampaignLink to={referralPath(code)} campaign={referral.campaign}>{referralLabels[code][language]}</CampaignLink></li>
          })}</ul>
        </div>
      </div>
    </section>

    <section className="editorial-section offers-signup" aria-labelledby="offers-signup-title">
      <div className="container editorial-split">
        <div><p className="eyebrow">{t('newsletter')}</p><h2 id="offers-signup-title">{t('signupTitle')}</h2></div>
        <SignupForm mode="campaign" />
      </div>
    </section>
    <div className="editorial-cta"><div className="container">
      <h2>{t('restaurantCta')}</h2><div className="editorial-actions">
        <Link className="button button--gold" to="/menu">{t('exploreMenu')}</Link>
        <Link className="button button--outline" to="/order">{t('order')}</Link>
        <Link className="button button--outline" to="/reservation">{t('reserve')}</Link>
      </div>
    </div></div>
  </div>
}
