import { useEffect, type RefObject } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import type { Language } from '../../types'

export type CanvasStatus = 'loading' | 'ready' | 'error'

export function GraphicPreview({ canvas, width, height, draw, status, setStatus, label, locale }: {
  canvas: RefObject<HTMLCanvasElement | null>; width: number; height: number
  draw: (ctx: CanvasRenderingContext2D) => Promise<void>
  status: CanvasStatus; setStatus: (status: CanvasStatus) => void; label: string; locale: Language
}) {
  const { t } = useLanguage()
  useEffect(() => {
    let current = true
    setStatus('loading')
    const surface = document.createElement('canvas')
    surface.width = width
    surface.height = height
    const ctx = surface.getContext('2d')
    if (!ctx) { setStatus('error'); return }
    void draw(ctx).then(() => {
      if (!current || !canvas.current) return
      const preview = canvas.current.getContext('2d')
      if (!preview) { setStatus('error'); return }
      preview.clearRect(0, 0, width, height)
      preview.drawImage(surface, 0, 0)
      setStatus('ready')
    }).catch(() => { if (current) setStatus('error') })
    return () => { current = false }
  }, [canvas, draw, width, height, setStatus])

  return <div className="graphic-preview" aria-busy={status === 'loading'}>
    <canvas ref={canvas} width={width} height={height} lang={locale} role="img" aria-label={label} />
    {status === 'error' && <p role="alert">{t('workspaceRenderError')}</p>}
  </div>
}
