import { m } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function Reveal({ children, className, delay = 0 }: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduced = useReducedMotion()
  return (
    <m.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      animate={reduced ? { opacity: 1, y: 0 } : undefined}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </m.div>
  )
}
