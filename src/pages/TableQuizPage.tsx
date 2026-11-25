import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import tableImage from '../assets/hero.webp'
import { EditorialHero } from '../components/experience/EditorialHero'
import { CampaignLink } from '../components/marketing/CampaignContent'
import { DishMedia } from '../components/menu/DishMedia'
import { useLanguage } from '../context/LanguageContext'
import { useOrdering } from '../context/OrderingContext'
import { campaignPath } from '../data/campaigns'
import { recordEvent } from '../data/marketingAnalytics'
import { quizFields, quizOptions, type QuizPreferences } from '../data/marketingPreferences'
import { aedCurrency, dishLink } from '../data/menuFilters'
import { calculateSubtotal, resolveDish } from '../data/orderMath'
import { reservationLink } from '../data/reservationLinks'
import { tableRecommendation } from '../data/tableRecommendations'
import type { CopyKey } from '../i18n/copy'
import { quizQuestions } from '../i18n/marketing'
import { zoneNames } from '../i18n/reservation'
import '../styles/hospitality.css'

const spendLabels: Partial<Record<string, CopyKey>> = { light: 'quizPriceLight', balanced: 'quizPriceBalanced', generous: 'quizPriceGenerous' }

function QuizResult({ preferences, restart }: { preferences: QuizPreferences; restart: () => void }) {
  const { t, language } = useLanguage()
  const { addMany } = useOrdering()
  const [suggestion] = useState(() => tableRecommendation(preferences))
  const [selected, setSelected] = useState(() => new Set(suggestion.dishes.map(({ itemId }) => itemId)))
  const [feedback, setFeedback] = useState<CopyKey | null>(null)
  const chosen = suggestion.dishes.filter(({ itemId }) => selected.has(itemId))
  const total = calculateSubtotal(chosen)
  const heading = useRef<HTMLHeadingElement>(null)
  const adding = useRef(false)

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
    heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [])

  async function addDishes() {
    if (!chosen.length || feedback === 'quizAdded' || adding.current) return
    adding.current = true
    const result = await addMany(chosen)
    adding.current = false
    setFeedback(result === 'ok' ? 'quizAdded' : result === 'limit' ? 'quizCartLimit' : 'unavailableDish')
  }

  return <section className="quiz-result" aria-labelledby="quiz-result-title">
    <h2 id="quiz-result-title" ref={heading} tabIndex={-1}>{t('quizResultTitle')}</h2>
    <p className="quiz-seating"><strong>{t('recommendedSeating')}</strong> · {zoneNames[suggestion.seating][language]}</p>
    {suggestion.campaign && <p className="quiz-match">
      <CampaignLink to={campaignPath(suggestion.campaign)} campaign={suggestion.campaign}>{suggestion.campaign.name[language]}</CampaignLink>
      <span>{suggestion.campaign.description[language]}</span>
    </p>}
    <fieldset className="quiz-review"><legend>{t('quizChooseDishes')}</legend>
      <ul role="list">
        {suggestion.dishes.map((dish) => {
          const resolved = resolveDish(dish)
          if (!resolved) return null
          const { item, variant, unitPrice } = resolved
          const dishName = language === 'ar' ? item.nameAr : item.nameEn
          return <li key={item.id}>
            <label>
              <input type="checkbox" checked={selected.has(item.id)} onChange={() => {
                setSelected((current) => {
                  const next = new Set(current)
                  if (next.has(item.id)) next.delete(item.id)
                  else next.add(item.id)
                  return next
                })
                setFeedback(null)
              }} />
              <DishMedia item={item} className="quiz-dish-image" />
              <span><strong>{dishName}</strong>{variant && <small>{variant.name[language]}</small>}</span>
              <bdi>{dish.quantity} × {aedCurrency[language].format(unitPrice / 100)}</bdi>
            </label>
            <Link to={dishLink(item.slug)} className="quiz-dish-link" aria-label={t('exploreMenu') + ' · ' + dishName}>{t('menu')}</Link>
          </li>
        })}
      </ul>
    </fieldset>
    <div className="quiz-total">
      <span>{t('quizEstimate')}</span><strong><bdi>{aedCurrency[language].format(total / 100)}</bdi></strong>
      <small>{t('quizEstimateNote')}</small>
    </div>
    <div className="editorial-actions">
      <button className="button button--forest" type="button" disabled={!chosen.length || feedback === 'quizAdded'} onClick={addDishes}>{t('quizAdd')}</button>
      <Link className="button button--line" to="/order">{t('order')}</Link>
      <Link className="button button--line" to={reservationLink(suggestion.seating, suggestion.occasion)}>{t('reserve')}</Link>
      <Link className="button button--line" to="/menu">{t('exploreMenu')}</Link>
    </div>
    <p className="quiz-feedback" role="status">{feedback && t(feedback)}</p>
    <button className="quiz-reset" type="button" onClick={restart}>{t('quizRestart')}</button>
  </section>
}

export default function TableQuizPage() {
  const { t, language } = useLanguage()
  const [step, setStep] = useState(-1)
  const [preferences, setPreferences] = useState<Partial<QuizPreferences>>({})
  const field = quizFields[step]
  const question = useRef<HTMLHeadingElement>(null)
  const locale = language === 'ar' ? 'ar-AE' : 'en-AE'

  useEffect(() => {
    if (field) {
      question.current?.focus({ preventScroll: true })
      question.current?.parentElement?.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
  }, [field])

  function start() {
    setPreferences({})
    setStep(0)
    void recordEvent('quiz_start')
  }

  function next() {
    if (!preferences[field]) return
    if (step === quizFields.length - 1) void recordEvent('quiz_complete', { preferences })
    setStep(step + 1)
  }

  return <div className="editorial-page table-quiz-page">
    <EditorialHero variant="restaurant" image={tableImage} label={t('diningExperiences')} title={t('quizTitle')} intro={t('quizIntro')}>
      {step < 0 && <button type="button" onClick={start} className="button button--gold">{t('quizStart')}</button>}
      <Link to="/offers" className="button button--outline">{t('viewCampaigns')}</Link>
    </EditorialHero>
    {step >= 0 && <div className="container quiz-container">
      {field ? <section id="table-quiz-question" className="quiz-question" aria-labelledby="quiz-question-title">
        <p className="quiz-progress">{t('quizProgress').replace('{step}', (step + 1).toLocaleString(locale)).replace('{total}', quizFields.length.toLocaleString(locale))}</p>
        <progress value={step + 1} max={quizFields.length} aria-label={t('quizProgress').replace('{step}', String(step + 1)).replace('{total}', String(quizFields.length))} />
        <h2 id="quiz-question-title" ref={question} tabIndex={-1}>{quizQuestions[field][language]}</h2>
        <form key={field} onSubmit={(event) => { event.preventDefault(); next() }}>
          <div className="quiz-options" role="radiogroup" aria-labelledby="quiz-question-title">
            {quizOptions[field].map((option) => {
              const spendKey = field === 'spend' ? spendLabels[option.id] : undefined
              return <label key={option.id}>
                <input type="radio" name={field} value={option.id} checked={preferences[field] === option.id}
                  onChange={() => setPreferences((current) => ({ ...current, [field]: option.id }))} />
                <span>{option.label[language]}{spendKey && <small>{t(spendKey)}</small>}</span>
              </label>
            })}
          </div>
          <div className="editorial-actions">
            <button className="button button--forest" type="submit" disabled={!preferences[field]}>{t(step + 1 === quizFields.length ? 'quizResult' : 'quizNext')}</button>
            {step > 0 && <button className="button button--line" type="button" onClick={() => setStep(step - 1)}>{t('quizPrevious')}</button>}
          </div>
        </form>
      </section> : <QuizResult preferences={preferences as QuizPreferences} restart={start} />}
    </div>}
  </div>
}
