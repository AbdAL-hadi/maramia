import { m } from 'framer-motion'
import { useState } from 'react'
import { SageSprig } from '../components/Brand'
import { Reveal } from '../components/Reveal'
import { useLanguage } from '../context/LanguageContext'
import { moments } from '../data/experience'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function Hospitality() {
  const { language, t } = useLanguage()
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const moment = moments[active]

  return (
    <section id="experience" className="hospitality section-space" aria-labelledby="experience-title" tabIndex={-1}>
      <div className="container hospitality-grid">
        <Reveal className="hospitality-visual">
          <div className="hospitality-frame">
            <m.img
              key={moment.image}
              src={moment.image}
              alt={moment.alt[language]}
              width="1200" height="900" loading="lazy" decoding="async"
              initial={reduced ? false : { opacity: 0.25, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduced ? 0 : 0.42 }}
            />
          </div>
          <SageSprig className="hospitality-sprig" />
        </Reveal>
        <Reveal className="hospitality-copy" delay={0.1}>
          <p className="eyebrow">{t('hospitality')}</p>
          <h2 id="experience-title">{t('hospitalityTitle')}</h2>
          <div className="moment-controls" role="group" aria-label={t('hospitality')}>
            {moments.map(({ label }, index) => (
              <button
                type="button" aria-pressed={index === active} aria-controls="moment-description"
                key={label.en}
                onClick={() => setActive(index)}
              >{label[language]}</button>
            ))}
          </div>
          <div className="moment-panel" id="moment-description" aria-live="polite">
            <m.div
              key={active}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.25 }}
            >
              <h3>{moment.title[language]}</h3>
              <p className="section-text">{moment.text[language]}</p>
            </m.div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
