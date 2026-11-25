import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { EditorialHero } from '../components/experience/EditorialHero'
import { CampaignActionLink, CampaignActions, CampaignDates, CampaignDishes, CampaignLink, CampaignOffer } from '../components/marketing/CampaignContent'
import { CampaignSharing } from '../components/marketing/CampaignSharing'
import { SignupForm } from '../components/SignupForm'
import { useLanguage } from '../context/LanguageContext'
import { campaignPath, campaigns, campaignStatus, referralPath, resolveReferral } from '../data/campaigns'
import { reservationLink } from '../data/reservationLinks'
import { campaignCategoriesCopy, campaignStatusCopy } from '../i18n/marketing'
import { occasionNames, zoneNames } from '../i18n/reservation'
import '../styles/hospitality.css'

const celebrationOccasions = ['birthday', 'anniversary', 'celebration'] as const

export default function CampaignPage() {
  const { campaignSlug } = useParams()
  const { search } = useLocation()
  const [params] = useSearchParams()
  const { language, t } = useLanguage()
  const campaign = campaigns.find((entry) => entry.slug === campaignSlug)
  if (!campaign) return <div className="preview-page">
    <div className="container">
      <h1>{t('campaignMissing')}</h1><p className="section-text">{t('campaignMissingText')}</p>
      <div className="preview-actions"><Link to="/offers" className="button button--forest">{t('viewCampaigns')}</Link></div>
    </div>
  </div>
  const status = campaignStatus(campaign)
  const active = status === 'active'
  const referral = resolveReferral(params.get('ref'))
  const linkedReferral = referral?.campaign.id === campaign.id ? referral : null
  const code = active ? linkedReferral?.code ?? campaign.code : null
  return <div className="editorial-page campaign-page">
    <EditorialHero variant="restaurant" image={campaign.image} label={campaignCategoriesCopy[campaign.category][language]} title={campaign.name[language]} intro={campaign.description[language]}>
      {active ? <>
        <CampaignActionLink campaign={campaign} action={campaign.primary} code={code ?? undefined} className="button button--gold" />
        <CampaignLink to={{ search, hash: '#campaign-details' }} campaign={campaign} className="button button--outline">{t('campaignTerms')}</CampaignLink>
      </> : <Link to="/offers" className="button button--gold">{t('viewCampaigns')}</Link>}
    </EditorialHero>
    <section className="editorial-section campaign-terms-section" id="campaign-details" tabIndex={-1} aria-labelledby="campaign-terms-title">
      <div className="container editorial-split">
        <div className="editorial-copy">
          <p className="eyebrow campaign-status">{campaignStatusCopy[status][language]}</p>
          <h2 id="campaign-terms-title">{t('campaignTerms')}</h2>
          <p className="section-text">{campaign.audience[language]}</p>
          <p>{t('campaignDemo')}</p>
          <p>{t('campaignMenuTerms')}</p>
          {campaign.seating && <p>{t('campaignBookingTerms')}</p>}
          {campaign.seating && <p><strong>{t('recommendedSeating')}</strong> · {zoneNames[campaign.seating][language]}</p>}
          <CampaignDates campaign={campaign} />
          {active ? <CampaignActions campaign={campaign} code={code ?? undefined} /> : <p>{t('campaignNotAvailable')}</p>}
        </div>
        <div className="campaign-contact-panel">
          {code && <><CampaignOffer campaign={campaign} code={code} /><p>{t('campaignCodeSingle')}</p></>}
          <CampaignSharing key={linkedReferral?.code ?? campaign.id} campaign={campaign}
            path={linkedReferral ? referralPath(linkedReferral.code) : campaignPath(campaign)} code={code} />
        </div>
      </div>
    </section>
    <CampaignDishes campaign={campaign} />
    {active && campaign.id === 'celebrations' && <section className="editorial-section occasions-section" aria-labelledby="campaign-occasion-title">
      <div className="container">
        <h2 id="campaign-occasion-title">{t('selectOccasion')}</h2>
        <ul className="occasion-links" role="list">
          {celebrationOccasions.map((occasion) => <li key={occasion}>
            <CampaignLink to={reservationLink('private', occasion)} campaign={campaign}>{occasionNames[occasion][language]}</CampaignLink>
          </li>)}
        </ul>
      </div>
    </section>}
    <section className="editorial-section offers-signup" aria-labelledby="campaign-signup-title">
      <div className="container editorial-split">
        <div><p className="eyebrow">{t('newsletter')}</p><h2 id="campaign-signup-title">{t('signupTitle')}</h2></div>
        <SignupForm mode="campaign" campaignId={campaign.id} />
      </div>
    </section>
    <div className="campaign-print">
      <Brand />
      <img src={campaign.image} alt="" />
      <h2>{campaign.name[language]}</h2><p>{campaign.description[language]}</p>
      <CampaignOffer campaign={campaign} code={code} />
      <p>{t('campaignDemo')}</p>
    </div>
  </div>
}
