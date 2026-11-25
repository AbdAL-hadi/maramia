import { Link } from 'react-router-dom'
import photo from '../assets/story.webp'
import { EditorialHero } from '../components/experience/EditorialHero'
import { FaqAccordion } from '../components/customer/FaqAccordion'
import { useLanguage } from '../context/LanguageContext'
import '../styles/hospitality.css'

export default function FaqPage() {
  const { t } = useLanguage()
  return <div className="editorial-page faq-page">
    <EditorialHero variant="story" image={photo} label={t('faqTitle')} title={t('faqHero')} intro={t('faqIntro')}>
      <a className="button button--gold" href="#faq-search">{t('faqSearch')}</a>
      <Link className="button button--outline" to="/contact">{t('contact')}</Link>
    </EditorialHero>
    <section className="editorial-section" id="faq-search" tabIndex={-1} aria-labelledby="faq-body-title">
      <div className="container faq-container">
        <h2 id="faq-body-title">{t('faqTitle')}</h2>
        <FaqAccordion />
      </div>
    </section>
  </div>
}
