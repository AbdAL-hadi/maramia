import { m } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { SageSprig } from '../Brand'

export function OrderHero({ title, intro }: { title: string; intro: string }) {
  const { t } = useLanguage()
  const reduced = useReducedMotion()
  return (
    <section className="order-hero" aria-labelledby="order-page-title">
      <m.div className="container" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.35 }}>
        <p className="eyebrow">{t('orderingDemo')}</p>
        <h1 id="order-page-title" tabIndex={-1}>{title}</h1>
        <p>{intro}</p>
      </m.div>
      <SageSprig className="order-hero-sprig" />
    </section>
  )
}
