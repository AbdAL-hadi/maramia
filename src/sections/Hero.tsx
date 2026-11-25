import { m, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/hero.webp'
import mobileHeroImage from '../assets/hero-mobile.webp'
import { SageSprig } from '../components/Brand'
import { useLanguage } from '../context/LanguageContext'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function Hero() {
  const { t } = useLanguage()
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])

  return (
    <section className="hero" ref={ref} aria-labelledby="home-title">
      <m.div className="hero-media" style={reduced ? undefined : { y }} aria-hidden="true">
        <picture>
          <source media="(max-width: 600px) and (max-aspect-ratio: 3/4)" srcSet={mobileHeroImage} width="650" height="940" />
          <img src={heroImage} width="1672" height="941" alt="" fetchPriority="high" />
        </picture>
      </m.div>
      <div className="hero-overlay" />
      <SageSprig className="hero-botanical" />
      <m.div
        className="hero-content"
        initial={reduced ? false : { y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: reduced ? 0 : 0.45, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <p className="eyebrow hero-kicker">{t('heroKicker')}</p>
        <h1 id="home-title" className="hero-title" lang="en" dir="ltr">MARAMIA <span>UAE</span></h1>
        <p className="hero-slogan">{t('heroLine')}</p>
        <div className="hero-actions">
          <Link className="button button--gold" to="/menu">{t('exploreMenu')}</Link>
          <Link className="button button--outline" to="/uae">{t('exploreUae')}</Link>
        </div>
      </m.div>
      <Link className="hero-scroll" to="/#story">
        <span>{t('scroll')}</span>
        <ChevronDown size={19} aria-hidden="true" />
      </Link>
    </section>
  )
}
