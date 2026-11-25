import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { SageSprig } from '../components/Brand'
import { Reveal } from '../components/Reveal'
import { EditorialHero } from '../components/experience/EditorialHero'
import { DishMedia } from '../components/menu/DishMedia'
import { useLanguage } from '../context/LanguageContext'
import { experienceImages, findEditorialDish, foodStories, storyValues } from '../data/brandExperience'
import { dishLink } from '../data/menuFilters'
import { ramallahReferences } from '../data/restaurant'
import '../styles/hospitality.css'

export default function AboutPage() {
  const { language, t } = useLanguage()
  return (
    <div className="editorial-page about-page">
      <EditorialHero variant="story" image={experienceImages.bread} label={t('story')} title={t('aboutHeading')} intro={t('aboutIntro')}>
        <Link className="button button--gold" to="/menu">{t('exploreMenu')}</Link>
        <Link className="button button--outline" to="/uae">{t('discoverRestaurant')}</Link>
      </EditorialHero>

      <section className="editorial-section" aria-labelledby="identity-title">
        <div className="container editorial-split">
          <Reveal className="editorial-copy">
            <p className="eyebrow">{t('storyIdentity')}</p>
            <h2 id="identity-title">{t('storyIdentityTitle')}</h2>
            <p className="section-text">{t('storyIdentityText')}</p>
            <div className="story-source">
              <p>{t('storyListing')}</p>
              <a className="location-link" href={ramallahReferences.lacasa} target="_blank" rel="noreferrer">
                <MapPin size={17} aria-hidden="true" />{t('storyListingLink')}
              </a>
            </div>
          </Reveal>
          <Reveal className="editorial-frame editorial-frame--arched">
            <img src={experienceImages.table} alt="" width="1672" height="941" loading="lazy" />
          </Reveal>
        </div>
      </section>

      <section className="editorial-section editorial-value-section" aria-labelledby="philosophy-title">
        <div className="container">
          <Reveal className="editorial-heading">
            <h2 id="philosophy-title">{t('storyPhilosophy')}</h2>
            <p>{t('storyPositioning')}</p>
          </Reveal>
          <ul className="story-values" role="list">
            {storyValues.map((value) => (
              <li key={value.name.en}><h3>{value.name[language]}</h3><p>{value.text[language]}</p></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="editorial-section editorial-sage" aria-labelledby="sage-title">
        <div className="container editorial-split">
          <Reveal className="editorial-frame editorial-frame--arched">
            <img src={experienceImages.tea} alt="" width="1080" height="810" loading="lazy" />
          </Reveal>
          <Reveal className="editorial-copy">
            <SageSprig className="story-leaf" />
            <h2 id="sage-title">{t('storySage')}</h2>
            <p className="section-text">{t('storySageText')}</p>
          </Reveal>
        </div>
      </section>

      <section className="editorial-section" aria-labelledby="kitchen-title">
        <div className="container">
          <Reveal className="editorial-heading"><h2 id="kitchen-title">{t('storyKitchen')}</h2></Reveal>
          <ul className="food-stories" role="list">
            {foodStories.map((entry) => {
              const dish = findEditorialDish(entry.id)
              if (!dish) return null
              return (
                <li className="food-story" key={entry.id}>
                  <DishMedia item={dish} className="food-story-image" />
                  <h3><Link to={dishLink(dish.slug)}>{language === 'ar' ? dish.nameAr : dish.nameEn}</Link></h3>
                  <p>{entry.text[language]}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="editorial-section story-uae-section" aria-labelledby="story-uae-title">
        <div className="container editorial-split">
          <Reveal className="editorial-copy">
            <h2 id="story-uae-title">{t('storyUae')}</h2>
            <p className="section-text">{t('storyUaeText')}</p>
          </Reveal>
          <Reveal className="editorial-frame">
            <img src={experienceImages.terrace} alt="" width="590" height="410" loading="lazy" />
          </Reveal>
        </div>
      </section>

      <section className="editorial-cta" aria-labelledby="story-cta-title">
        <div className="container">
          <h2 id="story-cta-title">{t('storyCta')}</h2>
          <div className="editorial-actions">
            <Link className="button button--gold" to="/menu">{t('exploreMenu')}</Link>
            <Link className="button button--outline" to="/uae">{t('discoverRestaurant')}</Link>
            <Link className="button button--outline" to="/reservation">{t('reserve')}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
