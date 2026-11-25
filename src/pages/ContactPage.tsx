import { CalendarDays, CircleHelp, PartyPopper, ShoppingBag } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import entrance from '../assets/experience/entrance.webp'
import { FaqAccordion } from '../components/customer/FaqAccordion'
import { EditorialHero } from '../components/experience/EditorialHero'
import { useLanguage } from '../context/LanguageContext'
import { isEmail } from '../data/contactValidation'
import { ramallahReferences, restaurantDetails } from '../data/restaurant'
import type { CopyKey } from '../i18n/copy'
import '../styles/hospitality.css'

const options = [
  { id: 'general', title: 'reachGeneral', description: 'reachGeneralText', to: '/faq', link: 'faqAll', Icon: CircleHelp },
  { id: 'reservation', title: 'reachReservation', description: 'reachReservationText', to: '/reservation/manage', link: 'reservationManage', Icon: CalendarDays },
  { id: 'ordering', title: 'reachOrdering', description: 'reachOrderingText', to: '/order', link: 'order', Icon: ShoppingBag },
  { id: 'private', title: 'reachPrivate', description: 'reachPrivateText', to: '/uae#dining-experiences', link: 'discoverRestaurant', Icon: PartyPopper },
] as const

type FormField = 'name' | 'email' | 'message'

function ContactForm() {
  const { t } = useLanguage()
  const id = useId()
  const form = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<Partial<Record<FormField, CopyKey>>>({})
  const [sent, setSent] = useState(false)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const values = { name: String(data.get('name') ?? '').trim(), email: String(data.get('email') ?? '').trim(), message: String(data.get('message') ?? '').trim() }
    const next: Partial<Record<FormField, CopyKey>> = {}
    if (!values.name) next.name = 'requiredField'
    if (!isEmail(values.email)) next.email = 'emailError'
    if (values.message.length < 10) next.message = 'reachMessageError'
    setErrors(next)
    const invalid = Object.keys(next)[0]
    if (invalid) {
      setSent(false)
      const control = form.current?.elements.namedItem(invalid)
      if (control instanceof HTMLElement) control.focus()
      return
    }
    event.currentTarget.reset()
    setSent(true)
  }

  return <form ref={form} className="report-panel reach-form" aria-labelledby={id + '-title'} onSubmit={submit} noValidate onChange={() => setSent(false)}>
    <h2 id={id + '-title'}>{t('reachForm')}</h2>
    <p className="report-note">{t('reachFormNote')}</p>
    <div className="workspace-fields">
      <label className="order-field">{t('name')}
        <input name="name" dir="auto" autoComplete="name" required maxLength={70}
          aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? id + '-name' : undefined} />
        {errors.name && <small className="field-error" id={id + '-name'}>{t(errors.name)}</small>}
      </label>
      <label className="order-field">{t('reachEmail')}
        <input name="email" type="email" dir="ltr" autoComplete="email" required maxLength={160}
          aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? id + '-email' : undefined} />
        {errors.email && <small className="field-error" id={id + '-email'}>{t(errors.email)}</small>}
      </label>
      <label className="order-field workspace-full">{t('reachTopic')}
        <select name="topic">{options.map(({ id, title }) => <option key={id} value={id}>{t(title)}</option>)}</select>
      </label>
      <label className="order-field workspace-full">{t('reachMessage')}
        <textarea name="message" dir="auto" rows={4} required minLength={10} maxLength={550}
          aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? id + '-message' : undefined} />
        {errors.message && <small className="field-error" id={id + '-message'}>{t(errors.message)}</small>}
      </label>
    </div>
    <button type="submit" className="button button--forest">{t('reachSubmit')}</button>
    {sent && <p role="status">{t('reachSuccess')}</p>}
  </form>
}

export default function ContactPage() {
  const { language, t } = useLanguage()
  const { address, hours, phone, email, instagram, facebook } = restaurantDetails
  return <div className="editorial-page reach-page">
    <EditorialHero variant="restaurant" image={entrance} label={t('contact')} title={t('reachTitle')} intro={t('reachIntro')}>
      <a className="button button--gold" href="#reach-form">{t('reachForm')}</a>
      <Link className="button button--outline" to="/reservation">{t('reserve')}</Link>
    </EditorialHero>
    <section className="editorial-section reach-help" aria-label={t('reachTitle')}>
      <div className="container reach-help-grid">
        {options.map(({ id, title, description, to, link, Icon }) => <article key={id}>
          <Icon size={23} aria-hidden="true" />
          <h2>{t(title)}</h2><p>{t(description)}</p><Link to={to}>{t(link)}</Link>
        </article>)}
      </div>
    </section>
    <section className="editorial-section reach-section" id="reach-form" tabIndex={-1} aria-label={t('reachForm')}>
      <div className="container workspace-grid">
        <div className="report-panel">
          <h2>{t('reachDetails')}</h2>
          <dl className="reach-details">
            <div><dt>{t('reachAddress')}</dt><dd>{address?.[language] ?? t('reachPending')}</dd></div>
            <div><dt>{t('reachHours')}</dt><dd>{hours?.[language] ?? t('reachPending')}</dd></div>
            <div><dt>{t('reachPhone')}</dt><dd>{phone ? <a href={'tel:' + phone}><bdi>{phone}</bdi></a> : t('reachPending')}</dd></div>
            <div><dt>{t('reachEmail')}</dt><dd>{email ? <a href={'mailto:' + email}><bdi>{email}</bdi></a> : t('reachPending')}</dd></div>
          </dl>
          <div className="editorial-actions">
            <a href={ramallahReferences.lacasa} target="_blank" rel="noopener noreferrer">{t('reachPalestine')}</a>
            <a href={ramallahReferences.facebook} target="_blank" rel="noopener noreferrer">{t('reachPalestineFacebook')}</a>
          </div>
          {(instagram || facebook) && <div className="editorial-actions">
            {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
            {facebook && <a href={facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
          </div>}
        </div>
        <ContactForm />
      </div>
    </section>
    <section className="editorial-section" aria-labelledby="reach-faq-title">
      <div className="container faq-container">
        <h2 id="reach-faq-title">{t('faqTitle')}</h2>
        <FaqAccordion search={false} subset={['order', 'manage', 'experiences']} />
        <div className="editorial-actions reach-cta">
          <Link className="button button--forest" to="/faq">{t('faqAll')}</Link>
          <Link className="button button--line" to="/menu">{t('exploreMenu')}</Link>
        </div>
      </div>
    </section>
  </div>
}
