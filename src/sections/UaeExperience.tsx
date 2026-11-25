import { Link } from 'react-router-dom'
import interior from '../assets/interior.webp'
import { Reveal } from '../components/Reveal'
import { useLanguage } from '../context/LanguageContext'

export function UaeExperience() {
  const { t } = useLanguage()
  return (
    <section id="uae" className="uae-section" aria-labelledby="uae-title" tabIndex={-1}>
      <img className="uae-photo" src={interior} width="1672" height="941" alt={t('uaeImage')} loading="lazy" decoding="async" />
      <div className="uae-shade" />
      <div className="container uae-inner">
        <Reveal className="uae-content">
          <p className="eyebrow light-eyebrow">{t('uae')}</p>
          <h2 id="uae-title">{t('uaeTitle')}</h2>
          <p className="section-text">{t('uaeText')}</p>
          <Link className="button button--gold" to="/uae#virtual-tour">{t('discover')}</Link>
        </Reveal>
      </div>
    </section>
  )
}
