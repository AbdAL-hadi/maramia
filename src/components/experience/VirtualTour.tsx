import { m } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { tourScenes } from '../../data/brandExperience'
import { reservationLink } from '../../data/reservationLinks'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export function VirtualTour() {
  const { t, language } = useLanguage()
  const reduced = useReducedMotion()
  const [sceneIndex, setSceneIndex] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(null)
  const pinRefs = useRef(new Map<string, HTMLButtonElement>())
  const thumbnails = useRef<HTMLDivElement>(null)
  const scene = tourScenes[sceneIndex]
  const detail = scene.hotspots.find((spot) => spot.id === activeId)
  const rtl = language === 'ar'
  const PreviousIcon = rtl ? ChevronRight : ChevronLeft
  const NextIcon = rtl ? ChevronLeft : ChevronRight

  function selectScene(index: number) {
    setSceneIndex((index + tourScenes.length) % tourScenes.length)
    setActiveId(null)
  }

  function closeDetail() {
    if (activeId) pinRefs.current.get(activeId)?.focus({ preventScroll: true })
    setActiveId(null)
  }

  function keys(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape' && activeId) {
      event.preventDefault()
      closeDetail()
      return
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const origin = event.target as HTMLElement
    if (!origin.closest('.tour-controls, .tour-thumbnails')) return
    event.preventDefault()
    const thumb = origin.closest<HTMLButtonElement>('.tour-thumbnail')
    const start = thumb ? Number(thumb.dataset.sceneIndex) : sceneIndex
    const advance = event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')
    selectScene(start + (advance ? 1 : -1))
    if (thumb) {
      requestAnimationFrame(() => thumbnails.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus())
    }
  }

  return (
    <section className="tour-section" id="virtual-tour" tabIndex={-1} aria-labelledby="tour-title">
      <div className="container">
        <div className="tour-heading">
          <div>
            <p className="eyebrow">{t('conceptImagery')}</p>
            <h2 id="tour-title">{t('virtualTour')}</h2>
            <p>{t('tourInstructions')}</p>
          </div>
          <div className="tour-controls" onKeyDown={keys}>
            <button className="editorial-icon-button" type="button" aria-label={t('previousScene')} onClick={() => selectScene(sceneIndex - 1)}>
              <PreviousIcon size={22} aria-hidden="true" />
            </button>
            <bdi aria-hidden="true">{String(sceneIndex + 1).padStart(2, '0')} / {String(tourScenes.length).padStart(2, '0')}</bdi>
            <button className="editorial-icon-button" type="button" aria-label={t('nextScene')} onClick={() => selectScene(sceneIndex + 1)}>
              <NextIcon size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="tour-view" onKeyDown={keys}>
          <div className="tour-stage" data-tour-scene={scene.id}>
            <m.img
              key={scene.id} src={scene.image} alt={scene.title[language]}
              initial={reduced ? false : { opacity: 0.4, scale: 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduced ? 0 : 0.38, ease: 'easeOut' }}
              loading="lazy" decoding="async"
            />
            <div className="tour-hotspots" role="group" aria-label={t('hotspotDetails')}>
              {scene.hotspots.map((spot) => (
                <button
                  key={spot.id} type="button" className="tour-pin" aria-label={spot.title[language]}
                  data-hotspot={spot.id} aria-expanded={activeId === spot.id} aria-controls="tour-detail"
                  ref={(button) => {
                    if (button) pinRefs.current.set(spot.id, button)
                    else pinRefs.current.delete(spot.id)
                  }}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  onClick={() => setActiveId(activeId === spot.id ? null : spot.id)}
                >
                  {activeId === spot.id ? <X size={17} aria-hidden="true" /> : <Plus size={19} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>
          <div className="tour-caption">
            <div aria-live="polite">
              <h3>{scene.title[language]}</h3>
              <p>{scene.description[language]}</p>
            </div>
            <div id="tour-detail" aria-live="polite" className={detail ? 'tour-detail' : undefined}>
              {detail && <>
                <div className="tour-detail-header">
                  <h4>{detail.title[language]}</h4>
                  <button type="button" className="editorial-icon-button" aria-label={t('closeHotspot')} onClick={closeDetail}>
                    <X size={17} aria-hidden="true" />
                  </button>
                </div>
                <p>{detail.description[language]}</p>
              </>}
            </div>
            <div className="editorial-actions">
              {scene.action === 'areas' ? (
                <Link className="button button--gold" to="#dining-experiences">{t('browseSeating')}</Link>
              ) : scene.action === 'menu' ? (
                <Link className="button button--gold" to="/menu">{t('exploreMenu')}</Link>
              ) : (
                <Link className="button button--gold" to={reservationLink(scene.action)}>{t('reserveExperience')}</Link>
              )}
            </div>
          </div>
        </div>
        <div className="tour-thumbnails" role="group" aria-label={t('tourScenes')} ref={thumbnails} onKeyDown={keys}>
          {tourScenes.map((entry, index) => (
            <button
              key={entry.id} type="button" className="tour-thumbnail" aria-pressed={index === sceneIndex} data-scene-index={index}
              onClick={() => selectScene(index)}
            >
              <img src={entry.image} alt="" loading="lazy" decoding="async" />
              <span>{entry.title[language]}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
