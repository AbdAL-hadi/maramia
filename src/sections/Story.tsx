import { Facebook, Instagram, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import bread from '../assets/story.webp'
import { SageSprig } from '../components/Brand'
import { Reveal } from '../components/Reveal'
import { useLanguage } from '../context/LanguageContext'
import { ramallahReferences } from '../data/restaurant'

export function Story() {
  const { t } = useLanguage()
  return (
    <section id="story" className="story section-space" aria-labelledby="story-title" tabIndex={-1}>
      <div className="container story-grid">
        <Reveal className="story-copy">
          <p className="eyebrow">{t('story')}</p>
          <h2 id="story-title">{t('storyTitle')}</h2>
          <p className="section-text">{t('storyText')}</p>
          <div className="story-origin">
            <a href={ramallahReferences.lacasa} target="_blank" rel="noreferrer" className="location-link">
              <MapPin size={17} aria-hidden="true" />{t('palestineLocation')}
            </a>
            <div className="story-social">
              <a href={ramallahReferences.instagram} target="_blank" rel="noreferrer" aria-label="Maramia Palestine Instagram" lang="en"><Instagram size={17} aria-hidden="true" /></a>
              <a href={ramallahReferences.facebook} target="_blank" rel="noreferrer" aria-label="Maramia Palestine Facebook" lang="en"><Facebook size={17} aria-hidden="true" /></a>
            </div>
          </div>
          <Link className="button button--line mt-4" to="/about">{t('story')}</Link>
          <SageSprig className="story-sprig" />
        </Reveal>
        <Reveal className="story-visual" delay={0.12}>
          <figure className="story-frame">
            <img src={bread} width="1120" height="840" alt={t('storyPhoto')} loading="lazy" decoding="async" />
          </figure>
          <div className="weave-border" aria-hidden="true" />
        </Reveal>
      </div>
    </section>
  )
}
