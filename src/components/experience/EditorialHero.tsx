import { m } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { SageSprig } from '../Brand'

export function EditorialHero({ image, variant, label, title, intro, children }: {
  image: string
  variant: 'story' | 'restaurant'
  label: string
  title: string
  intro: string
  children: ReactNode
}) {
  const reduced = useReducedMotion()
  return (
    <section className={`editorial-hero editorial-hero--${variant}`} aria-labelledby="editorial-title">
      <img className="editorial-hero-image" src={image} alt="" fetchPriority="high" />
      <SageSprig className="editorial-hero-sprig" />
      <m.div
        className="container editorial-hero-content"
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.48 }}
      >
        <p className="eyebrow">{label}</p>
        <h1 id="editorial-title">{title}</h1>
        <p className="editorial-hero-intro">{intro}</p>
        <div className="editorial-actions">{children}</div>
      </m.div>
    </section>
  )
}
