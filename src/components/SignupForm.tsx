import { CheckCircle2 } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { recordEvent } from '../data/marketingAnalytics'
import { quizOptions, type MarketingPreferences } from '../data/marketingPreferences'
import { occasions } from '../data/reservations'
import { occasionNames } from '../i18n/reservation'

type SignupMode = 'opening' | 'newsletter' | 'campaign'

export function SignupForm({ mode, campaignId }: { mode: SignupMode; campaignId?: string }) {
  const { t, language } = useLanguage()
  const id = useId()
  const busy = useRef(false)
  const [status, setStatus] = useState<'saved' | 'storageError' | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current) return
    const form = event.currentTarget
    const fields = new FormData(form)
    if (fields.get('consent') !== 'on') return
    const food = quizOptions.food.find((item) => item.id === fields.get('food'))?.id
    const newsletterOccasion = occasions.find((item) => item === fields.get('occasion'))
    const preferences: MarketingPreferences = { food, newsletterOccasion }
    busy.current = true
    const saved = await recordEvent('newsletter_submit', campaignId ? { campaignId, preferences } : { preferences })
    busy.current = false
    setStatus(saved ? 'saved' : 'storageError')
    if (saved) form.reset()
  }

  return (
    <form className={'signup-form signup-form--' + mode + ' preference-signup'} onSubmit={(event) => void submit(event)}
      onChange={() => { if (status) setStatus(null) }} aria-describedby={id + '-note'}>
      <div className="signup-fields">
        <label className="signup-field">
          <span>{t('signupFood')}</span>
          <select name="food" defaultValue="">
            <option value="">{t('signupOptional')}</option>
            {quizOptions.food.map((item) => <option key={item.id} value={item.id}>{item.label[language]}</option>)}
          </select>
        </label>
        <label className="signup-field">
          <span>{t('signupOccasion')}</span>
          <select name="occasion" defaultValue="">
            <option value="">{t('signupOptional')}</option>
            {occasions.map((occasion) => <option key={occasion} value={occasion}>{occasionNames[occasion][language]}</option>)}
          </select>
        </label>
      </div>
      <label className="signup-consent"><input type="checkbox" name="consent" required /> <span>{t('signupConsent')}</span></label>
      <button className={'button ' + (mode === 'opening' ? 'button--forest' : 'button--gold')} type="submit">{t(mode === 'opening' ? 'register' : 'subscribe')}</button>
      <small className="form-note" id={id + '-note'}>{t('signupDemo')}</small>
      <p className={'form-status' + (status === 'storageError' ? ' field-error' : '')} role="status">
        {status === 'saved' && <span><CheckCircle2 size={17} aria-hidden="true" />{t('signupSuccess')}</span>}
        {status === 'storageError' && t('storageError')}
      </p>
    </form>
  )
}
