import { Leaf, Printer, Sprout } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/hospitality.webp'
import tableImage from '../assets/hero.webp'
import coffeeImage from '../assets/menu/palestinian-coffee.webp'
import dessertImage from '../assets/menu/nabulsi-knafeh.webp'
import mezzeImage from '../assets/menu-hero.webp'
import roomImage from '../assets/interior.webp'
import privateImage from '../assets/seating/private.webp'
import { Brand, SageSprig } from '../components/Brand'
import { EditorialHero } from '../components/experience/EditorialHero'
import { LoyaltyRecommendations } from '../components/loyalty/LoyaltyRecommendations'
import { loyaltyNumber, TierProgress } from '../components/loyalty/LoyaltySummary'
import { rewardStatusCopy } from '../components/loyalty/RewardPicker'
import { useLanguage } from '../context/LanguageContext'
import { useOrdering } from '../context/OrderingContext'
import { membershipTotals, qualifiesForTier, rewardAccess, rewards, tiers, transactionNames, visitPoints, welcomePoints, type LoyaltyMembership, type LoyaltyTransaction, type TierId } from '../data/loyalty'
import { sampleMembership } from '../data/loyaltySamples'
import { aedCurrency, dishLink } from '../data/menuFilters'
import { menuCatalog } from '../data/menu'
import '../styles/hospitality.css'

const imagery: Record<string, string> = { aed5: mezzeImage, aed15: tableImage, aed35: roomImage, coffee: coffeeImage, knafeh: dessertImage, 'golden-table': privateImage }
const questions = [
  ['rewardsFaqEarnQ', 'rewardsFaqEarnA'], ['rewardsFaqTierQ', 'rewardsFaqTierA'], ['rewardsFaqLocalQ', 'rewardsFaqLocalA'],
] as const

function MemberCard({ member, sample }: { member: LoyaltyMembership; sample: boolean }) {
  const { t, language } = useLanguage()
  const { tier, balance } = membershipTotals(member)
  const locale = language === 'ar' ? 'ar-AE' : 'en-AE'
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'Asia/Dubai' }).format(member.joinedAt)
  const Icon = tier.id === 'olive' ? Leaf : Sprout
  return <div className={'loyalty-digital-card loyalty-print-card loyalty-card-' + tier.id} data-testid="loyalty-card" data-tier={tier.id}>
    <div className="loyalty-card-top"><Brand /><span>{t(sample ? 'rewardsSampleOnly' : 'rewardsPrintNote')}</span></div>
    <div className="loyalty-card-art" aria-hidden="true">
      {tier.id === 'sage' ? <SageSprig /> : <><Icon strokeWidth={0.75} /><Leaf strokeWidth={0.7} /></>}
    </div>
    <div className="loyalty-card-level"><p>{t('rewardsTier')}</p><h3>{tier.name[language]}</h3></div>
    <dl className="loyalty-card-figures">
      <div><dt>{t('rewardsMembership')}</dt><dd><bdi data-testid="loyalty-member-id">{member.id}</bdi></dd></div>
      <div><dt>{t('rewardsBalance')}</dt><dd><bdi data-testid="loyalty-balance">{loyaltyNumber(balance, language)}</bdi></dd></div>
    </dl>
    <p className="loyalty-card-date">{t('rewardsMemberSince').replace('{date}', date)}</p>
  </div>
}

function Transactions({ entries }: { entries: readonly LoyaltyTransaction[] }) {
  const { language } = useLanguage()
  const date = new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-AE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Dubai' })
  return <ul className="loyalty-transactions" role="list">
    {entries.map((entry) => {
      const reward = rewards.find(({ id }) => id === entry.rewardId)
      return <li key={entry.id} data-transaction={entry.type}>
        <div>
          <strong>{transactionNames[entry.type][language]}</strong>
          {reward && <span>{reward.name[language]}</span>}
          {entry.reference && <bdi>{entry.reference}</bdi>}
        </div>
        <time dateTime={new Date(entry.timestamp).toISOString()}>{date.format(entry.timestamp)}</time>
        <bdi className={entry.points < 0 ? 'loyalty-debit' : 'loyalty-credit'}>{entry.points > 0 ? '+' : ''}{loyaltyNumber(entry.points, language)}</bdi>
      </li>
    })}
  </ul>
}

function RewardCatalog({ member, sample }: { member?: LoyaltyMembership; sample: boolean }) {
  const { language, t } = useLanguage()
  const { itemCount } = useOrdering()
  const { tier, balance } = membershipTotals(member)
  const next = rewards.filter((reward) => reward.active && qualifiesForTier(tier.id, reward.tier) && reward.points > balance)
    .sort((a, b) => a.points - b.points)[0]
  const number = (value: number) => loyaltyNumber(value, language)
  return <section className="editorial-section loyalty-catalog" id="loyalty-catalog" tabIndex={-1} aria-labelledby="loyalty-catalog-title">
    <div className="container">
      <div className="editorial-heading">
        <h2 id="loyalty-catalog-title">{t('rewardsCatalog')}</h2>
        <p>{t('rewardsCatalogIntro')}</p>
      </div>
      {member && <div className="loyalty-next">
        <h3>{t('rewardsNext')}</h3>
        {next ? <>
          <p><strong>{next.name[language]}</strong> · {t('rewardsNextRemaining').replace('{points}', number(next.points - balance))}</p>
          <progress value={balance} max={next.points} aria-label={t('rewardsNext')} />
        </> : <p>{t('rewardsAllUnlocked')}</p>}
      </div>}
      <div className="loyalty-reward-grid">
        {rewards.map((reward) => {
          const access = rewardAccess(reward, member)
          const benefit = reward.benefit
          const dish = benefit.kind === 'item' ? menuCatalog.find(({ id }) => id === benefit.itemId) : undefined
          const tier = tiers.find((entry) => entry.id === reward.tier)
          const currency = (value: number) => aedCurrency[language].format(value / 100)
          return <article className="loyalty-reward" key={reward.id} data-reward={reward.id} aria-labelledby={'reward-name-' + reward.id}>
            <img className="loyalty-reward-image" src={imagery[reward.id] ?? tableImage} alt="" loading="lazy" />
            <div className="loyalty-reward-body">
              <div className="loyalty-reward-meta"><span>{tier?.name[language]}</span><strong>{t('rewardsPointCount').replace('{points}', number(reward.points))}</strong></div>
              <h3 id={'reward-name-' + reward.id}>{reward.name[language]}</h3>
              <p>{benefit.kind === 'fixed' ? t('rewardFixedTerm').replace('{amount}', currency(benefit.fils))
                : dish && t('rewardItemTerm').replace('{item}', language === 'ar' ? dish.nameAr : dish.nameEn)}</p>
              <p>{t('rewardsMinSpend').replace('{amount}', currency(reward.minimum))}</p>
              <p className={'loyalty-reward-status status-' + access}>{t(rewardStatusCopy[access])}</p>
              {access === 'eligible' && !sample && <div className="editorial-actions">
                <Link className="button button--forest" to={'/order?reward=' + reward.id}>{t('rewardSelect')}</Link>
                {!itemCount && dish && <Link className="button button--line" to={dishLink(dish.slug)}>{t('menu')}</Link>}
              </div>}
            </div>
          </article>
        })}
      </div>
    </div>
  </section>
}

export default function LoyaltyPage() {
  const { t, language } = useLanguage()
  const { loyalty, joinRewards } = useOrdering()
  const [sampleTier, setSampleTier] = useState<TierId | null>(null)
  const [sampleVisit, setSampleVisit] = useState(false)
  const [pending, setPending] = useState(false)
  const [joinError, setJoinError] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const member = sampleTier ? sampleMembership(sampleTier, Date.now(), sampleVisit) : loyalty
  const entries = member ? [...member.ledger].reverse() : []
  const number = (value: number) => loyaltyNumber(value, language)


  function focusMember() {
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true })
      heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    })
  }

  async function join() {
    setPending(true)
    const result = await joinRewards()
    setPending(false)
    setJoinError(!result)
    if (result) focusMember()
  }

  function preview(tier: TierId | null) {
    setSampleTier(tier)
    setSampleVisit(false)
    focusMember()
  }

  return <div className="editorial-page loyalty-page">
    <EditorialHero image={heroImage} variant="restaurant" label={t('heroKicker')} title={t('rewardsHero')} intro={t('rewardsIntro')}>
      {member ? <Link to="#membership" className="button button--gold">{t('rewardsCardLink')}</Link>
        : <button className="button button--gold" type="button" disabled={pending} onClick={() => void join()}>{t('rewardsJoin')}</button>}
      <Link to="#loyalty-catalog" className="button button--outline">{t('rewardsView')}</Link>
    </EditorialHero>
    <section id="membership" className="editorial-section loyalty-member-section" tabIndex={-1} aria-labelledby="loyalty-member-title">
      <div className="container">
        <div className="editorial-heading loyalty-member-heading">
          <p className="eyebrow">{t('rewardsName')}</p>
          <h2 id="loyalty-member-title" ref={heading} tabIndex={-1}>{t(member ? 'rewardsCard' : 'rewardsJoin')}</h2>
          <p>{t('rewardsLocal')}</p>
        </div>
        {sampleTier && <div className="loyalty-sample-banner" role="status">
          <p>{t('rewardsSampleNotice')}</p>
          <button type="button" className="button button--line" onClick={() => preview(null)}>{t('rewardsExitSample')}</button>
        </div>}
        {member ? <div className="loyalty-member-grid">
          <MemberCard member={member} sample={Boolean(sampleTier)} />
          <div className="loyalty-member-details">
            <p className="loyalty-member-status">{t(sampleTier ? 'rewardsSampleOnly' : 'rewardsMember')}</p>
            <TierProgress member={member} />
            <button type="button" className="button button--line" onClick={() => window.print()}><Printer size={17} aria-hidden="true" />{t('rewardsPrint')}</button>
          </div>
        </div> : <>
          <p className="loyalty-welcome-text">{t('rewardsWelcome').replace('{points}', number(welcomePoints))}</p>
          <button className="button button--forest" type="button" disabled={pending} onClick={() => void join()}>{t('rewardsJoin')}</button>
        </>}
        {joinError && <p role="alert" className="field-error">{t('storageError')}</p>}
      </div>
    </section>

    <section className="editorial-section loyalty-tiers" aria-labelledby="loyalty-tier-title">
      <div className="container">
        <div className="editorial-heading"><h2 id="loyalty-tier-title">{t('rewardsTiers')}</h2></div>
        <ul className="loyalty-tier-grid" role="list">{tiers.map((tier) => <li className={'loyalty-tier loyalty-tier-' + tier.id} key={tier.id}>
          <h3>{tier.name[language]}</h3>
          <p>{t('rewardsTierRange').replace('{points}', number(tier.threshold))}</p>
          <p><strong>{t('rewardsEarnRate').replace('{rate}', number(tier.multiplier / 100))}</strong></p>
          <p>{tier.benefit[language]}</p>
        </li>)}</ul>
      </div>
    </section>

    <RewardCatalog member={member} sample={Boolean(sampleTier)} />

    <section className="editorial-section loyalty-history" aria-labelledby="loyalty-history-title">
      <div className="container">
        <div className="editorial-heading"><h2 id="loyalty-history-title">{t('rewardsHistory')}</h2></div>
        {entries.length ? <>
          <h3>{t('rewardsRecent')}</h3>
          <Transactions entries={entries.slice(0, 3)} />
          <details className="loyalty-history-all"><summary>{t('rewardsAllActivity')}</summary><Transactions entries={entries} /></details>
        </> : <p>{t('rewardsHistoryEmpty')}</p>}
      </div>
    </section>
    <LoyaltyRecommendations member={member} sample={Boolean(sampleTier)} />

    <section className="editorial-section loyalty-terms" aria-labelledby="loyalty-terms-title">
      <div className="container loyalty-bottom-grid">
        <div>
          <h2>{t('rewardsFaq')}</h2>
          {questions.map(([question, answer]) => <details key={question}><summary>{t(question)}</summary><p>{t(answer)}</p></details>)}
        </div>
        <div>
          <h2 id="loyalty-terms-title">{t('rewardsTerms')}</h2>
          <p>{t('rewardsTermsPoints')}</p>
          <p>{t('rewardsTermsVisit').replace('{points}', number(visitPoints))}</p>
          <p>{t('rewardConflict')}</p>
          <p>{t('rewardsTermsStorage')}</p>
        </div>
      </div>
    </section>

    <section className="editorial-section loyalty-presenter" aria-labelledby="loyalty-presenter-title">
      <div className="container">
        <h2 id="loyalty-presenter-title">{t('rewardsPresenter')}</h2>
        <div className="editorial-actions">
          {tiers.map((tier) => <button className="button button--line" type="button" key={tier.id}
            aria-pressed={sampleTier === tier.id} onClick={() => preview(tier.id)}>{t('rewardsSample').replace('{tier}', tier.name[language])}</button>)}
          {sampleTier && <button className="button button--forest" type="button" disabled={sampleVisit} onClick={() => { setSampleVisit(true); focusMember() }}>{t('rewardsSampleVisit')}</button>}
        </div>
      </div>
    </section>
  </div>
}
