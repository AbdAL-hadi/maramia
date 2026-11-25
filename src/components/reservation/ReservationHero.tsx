import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import interior from '../../assets/interior.webp'
import { useLanguage } from '../../context/LanguageContext'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { SageSprig } from '../Brand'

export function ReservationHero({ title, intro, manage = false, photo = false }: {
  title: string
  intro: string
  manage?: boolean
  photo?: boolean
}) {
  const { t } = useLanguage()
  const reduced = useReducedMotion()
  return (
    <section className={`reservation-hero${photo ? ' reservation-hero--photo' : ''}`} aria-labelledby="reservation-title">
      {photo && <img className="reservation-hero-media" src={interior} alt="" width="1672" height="941" fetchPriority="high" />}
      <SageSprig className="reservation-hero-sprig" />
      <m.div className="container" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.38 }}>
        <p className="eyebrow">{t('reservationDemo')}</p>
        <h1 id="reservation-title">{title}</h1>
        <p>{intro}</p>
        {manage && <Link className="button button--outline" to="/reservation/manage">{t('reservationManage')}</Link>}
      </m.div>
    </section>
  )
}
