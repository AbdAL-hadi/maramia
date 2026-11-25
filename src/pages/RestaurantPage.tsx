import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { Reveal } from '../components/Reveal'
import { DiningCollections } from '../components/experience/DiningCollections'
import { EditorialHero } from '../components/experience/EditorialHero'
import { RestaurantGallery } from '../components/experience/RestaurantGallery'
import { VirtualTour } from '../components/experience/VirtualTour'
import { useLanguage } from '../context/LanguageContext'
import { celebrationOptions, experienceImages } from '../data/brandExperience'
import { reservationLink } from '../data/reservationLinks'
import { occasionNames } from '../i18n/reservation'
import '../styles/hospitality.css'

export default function RestaurantPage() {
  const { language, t } = useLanguage()

  return (
    <div className="editorial-page restaurant-page">
      <EditorialHero variant="restaurant" image={experienceImages.interior} label={t('uae')} title={t('restaurantHeading')} intro={t('restaurantIntro')}>
        <Link className="button button--gold" to="#virtual-tour">{t('startTour')}</Link>
        <Link className="button button--outline" to="/reservation">{t('reserve')}</Link>
      </EditorialHero>

      <section className="editorial-section editorial-atmosphere" aria-labelledby="atmosphere-title">
        <div className="container editorial-split">
          <Reveal className="editorial-copy">
            <p className="eyebrow">{t('atmosphere')}</p>
            <h2 id="atmosphere-title">{t('atmosphereTitle')}</h2>
            <p className="section-text">{t('atmosphereText')}</p>
          </Reveal>
          <Reveal className="editorial-frame">
            <img src={experienceImages.family} alt="" width="590" height="410" loading="lazy" />
          </Reveal>
        </div>
      </section>

      <VirtualTour />
      <DiningCollections />

      <section className="editorial-section occasions-section" aria-labelledby="celebrations-title">
        <div className="container editorial-split">
          <Reveal className="editorial-frame editorial-frame--arched">
            <img src={experienceImages.privateDining} alt="" width="590" height="410" loading="lazy" />
          </Reveal>
          <Reveal className="editorial-copy">
            <h2 id="celebrations-title">{t('celebrationsHeading')}</h2>
            <p className="section-text">{t('celebrationsText')}</p>
            <ul className="occasion-links" role="list">
              {celebrationOptions.map(({ occasion, seating }) => (
                <li key={occasion}><Link to={reservationLink(seating, occasion)}><CalendarDays size={16} aria-hidden="true" />{occasionNames[occasion][language]}</Link></li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <RestaurantGallery />

      <section className="editorial-cta" aria-labelledby="restaurant-cta-title">
        <div className="container">
          <h2 id="restaurant-cta-title">{t('restaurantCta')}</h2>
          <div className="editorial-actions">
            <Link className="button button--gold" to="/reservation">{t('reserve')}</Link>
            <Link className="button button--outline" to="/menu">{t('exploreMenu')}</Link>
            <Link className="button button--outline" to="/order">{t('order')}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
