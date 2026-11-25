import '../styles/tools.css'
import { useRef, useState, type FormEvent } from 'react'
import image from '../assets/hospitality.webp'
import { EditorialHero } from '../components/experience/EditorialHero'
import { useLanguage } from '../context/LanguageContext'
import { cleanRatings, feedbackFields, type FeedbackRatings } from '../data/customerFeedback'
import { recordEvent } from '../data/marketingAnalytics'
import type { CopyKey } from '../i18n/copy'
import { feedbackLabels } from '../i18n/tools'
import '../styles/hospitality.css'

export default function FeedbackPage() {
  const { language, t } = useLanguage()
  const [ratings, setRatings] = useState<FeedbackRatings>({})
  const [message, setMessage] = useState<CopyKey | null>(null)
  const submitting = useRef(false)
  const submitted = message === 'feedbackThankYou'
  const locale = language === 'ar' ? 'ar-AE' : 'en-AE'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || submitted) return
    const clean = cleanRatings(ratings)
    if (!Object.keys(clean).length) {
      setMessage('feedbackRequired')
      return
    }
    submitting.current = true
    const saved = await recordEvent('customer_feedback', { ratings: clean })
    setMessage(saved ? 'feedbackThankYou' : 'storageError')
    submitting.current = false
  }

  return <div className="editorial-page feedback-page">
    <EditorialHero variant="restaurant" image={image} label={t('feedbackTitle')} title={t('feedbackHero')} intro={t('feedbackIntro')}>
      <a className="button button--gold" href="#guest-ratings">{t('feedbackForm')}</a>
    </EditorialHero>
    <section className="editorial-section" id="guest-ratings" tabIndex={-1} aria-labelledby="feedback-heading">
      <div className="container feedback-container">
        <h2 id="feedback-heading">{t('feedbackForm')}</h2>
        <p className="section-text">{t('feedbackGuide')}</p>
        <form className="feedback-form" onSubmit={(event) => void submit(event)}>
          {feedbackFields.map((field) => {
            const nps = field === 'recommendation'
            const numbers = Array.from({ length: nps ? 11 : 5 }, (_, index) => nps ? index : index + 1)
            return <fieldset key={field} name={field} disabled={submitted}>
              <legend>{feedbackLabels[field][language]}</legend>
              {nps && <p>{t('feedbackNpsGuide')}</p>}
              <div className="rating-choices">
                {numbers.map((score) => <label className="rating-option" key={score}>
                  <input type="radio" name={field} value={score} checked={ratings[field] === score} onChange={() => {
                    setRatings((previous) => ({ ...previous, [field]: score }))
                    setMessage(null)
                  }} />
                  <span>{score.toLocaleString(locale)}</span>
                </label>)}
                {ratings[field] !== undefined && <button type="button" className="rating-clear" onClick={() => {
                  setRatings((previous) => ({ ...previous, [field]: undefined }))
                  setMessage(null)
                }}>{t('feedbackSkip')}</button>}
              </div>
            </fieldset>
          })}
          <button type="submit" className="button button--forest" disabled={submitted}>{t('feedbackSend')}</button>
          {message && <p className="feedback-confirmation" role={submitted ? 'status' : 'alert'}>{t(message)}</p>}
        </form>
      </div>
    </section>
  </div>
}
