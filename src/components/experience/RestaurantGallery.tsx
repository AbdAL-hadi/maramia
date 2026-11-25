import { m } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { galleryPhotos } from '../../data/brandExperience'
import { useModalFocus } from '../../hooks/useModalFocus'
import { useReducedMotion } from '../../hooks/useReducedMotion'

function GalleryLightbox({ index, change, onClose }: {
  index: number
  change: (index: number) => void
  onClose: () => void
}) {
  const { language, t } = useLanguage()
  const reduced = useReducedMotion()
  const dialog = useRef<HTMLDialogElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  const next = useRef<HTMLButtonElement>(null)
  const photo = galleryPhotos[index]
  const rtl = language === 'ar'
  const PreviousIcon = rtl ? ChevronRight : ChevronLeft
  const NextIcon = rtl ? ChevronLeft : ChevronRight
  useModalFocus(dialog, close, 'gallery')

  function move(delta: number) {
    change((index + delta + galleryPhotos.length) % galleryPhotos.length)
  }

  function keys(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'Tab') {
      const boundary = event.shiftKey ? close.current : next.current
      if (event.target === boundary) {
        event.preventDefault()
        const target = event.shiftKey ? next.current : close.current
        target?.focus()
      }
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      change(event.key === 'Home' ? 0 : galleryPhotos.length - 1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      move(event.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? 1 : -1)
    }
  }

  return (
    <dialog ref={dialog} className="gallery-lightbox" aria-label={t('galleryImages')} onKeyDown={keys}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="gallery-dialog-panel">
        <div className="gallery-dialog-top">
          <bdi aria-hidden="true">{index + 1} / {galleryPhotos.length}</bdi>
          <button type="button" className="editorial-icon-button" ref={close} aria-label={t('closeGallery')} onClick={onClose}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <figure className="gallery-viewer">
          <div className="gallery-viewer-image">
            <m.img key={photo.id} src={photo.image} alt=""
              initial={reduced ? false : { opacity: 0.38 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.24 }} />
          </div>
          <figcaption aria-live="polite">{photo.caption[language]}</figcaption>
        </figure>
        <div className="gallery-dialog-actions">
          <button type="button" className="editorial-icon-button" aria-label={t('previousImage')} onClick={() => move(-1)}>
            <PreviousIcon size={23} aria-hidden="true" />
          </button>
          <button type="button" className="editorial-icon-button" ref={next} aria-label={t('nextImage')} onClick={() => move(1)}>
            <NextIcon size={23} aria-hidden="true" />
          </button>
        </div>
      </div>
    </dialog>
  )
}

export function RestaurantGallery() {
  const { language, t } = useLanguage()
  const [active, setActive] = useState<number | null>(null)
  return (
    <section className="editorial-section gallery-section" id="gallery" tabIndex={-1} aria-labelledby="gallery-title">
      <div className="container">
        <div className="editorial-heading">
          <p className="eyebrow">{t('conceptImagery')}</p>
          <h2 id="gallery-title">{t('galleryHeading')}</h2>
        </div>
        <ul className="gallery-grid" role="list">
          {galleryPhotos.map((photo, index) => (
            <li key={photo.id}>
              <button type="button" className="gallery-tile" aria-haspopup="dialog" onClick={() => setActive(index)}>
                <span className="gallery-tile-photo">
                  <img src={photo.image} alt="" loading="lazy" decoding="async" />
                  <span className="gallery-zoom"><ZoomIn size={19} aria-hidden="true" /></span>
                </span>
                <span>{photo.caption[language]}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {active !== null && <GalleryLightbox index={active} change={setActive} onClose={() => setActive(null)} />}
    </section>
  )
}
