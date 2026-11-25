import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DestinationFields } from '../components/marketing/DestinationFields'
import { useWorkspaceCopy, WorkspaceCopyResult } from '../components/marketing/WorkspaceCopy'
import { WorkspaceShell } from '../components/marketing/WorkspaceShell'
import { useLanguage } from '../context/LanguageContext'
import { findCampaign, referrals, resolveReferral, type ReferralCode } from '../data/campaigns'
import { recordEvent } from '../data/marketingAnalytics'
import {
  campaignTrackingUrl, defaultLinkConfig, isLoopback, linkMedia, linkSources, loadSavedLinks, referralLabels,
  saveLinkConfiguration, siteDestinations, type LinkConfig,
} from '../data/marketingTools'
import type { CopyKey } from '../i18n/copy'

const referralCodes = Object.keys(referrals) as ReferralCode[]

export default function CampaignLinksPage() {
  const { t, language } = useLanguage()
  const [config, setConfig] = useState<LinkConfig>(defaultLinkConfig)
  const [saved, setSaved] = useState(loadSavedLinks)
  const [notice, setNotice] = useState<CopyKey | null>(null)
  const [generated, setGenerated] = useState('')
  const clipboard = useWorkspaceCopy()
  const url = campaignTrackingUrl(config)
  const current = generated === url && Boolean(url)

  function change(update: Partial<LinkConfig>) {
    setConfig((previous) => ({ ...previous, ...update }))
    setGenerated('')
    setNotice(null)
    clipboard.clearCopy()
  }

  function chooseCampaign(id: string) {
    change({ campaign: id, name: findCampaign(id)?.attribution ?? config.name, referral: '' })
  }

  function generate() {
    if (!url || current) return
    setGenerated(url)
    setNotice('linksCreated')
    void recordEvent('campaign_link_generated', { campaignId: findCampaign(config.campaign)?.id ?? resolveReferral(config.referral)?.campaign.id })
  }

  async function save() {
    if (!url) return
    try {
      const name = new URL(url).searchParams.get('utm_campaign') ?? ''
      if (!await saveLinkConfiguration({ ...config, name })) throw new Error()
      setSaved(loadSavedLinks())
      setNotice('linksSaved')
    } catch {
      setNotice('storageError')
    }
  }

  return <WorkspaceShell title="linksTitle" intro="linksIntro">
    <div className="workspace-grid">
      <section className="report-panel workspace-controls" aria-labelledby="links-settings">
        <h2 id="links-settings">{t('workspaceCustomize')}</h2>
        <div className="workspace-fields">
          <DestinationFields destination={config.destination} campaign={config.campaign} dish={config.dish} alwaysCampaign
            choose={(destination) => {
              if (destination === 'custom') return
              if (destination === 'campaign' && !config.campaign) change({ destination, campaign: defaultLinkConfig.campaign, referral: '' })
              else change({ destination })
            }} setCampaign={chooseCampaign} setDish={(dish) => change({ dish })} />
          <label className="order-field">{t('linksSource')}
            <select value={config.source} onChange={(event) => change({ source: event.target.value as LinkConfig['source'] })}>
              {Object.entries(linkSources).map(([id, label]) => <option value={id} key={id}>{label[language]}</option>)}
            </select>
          </label>
          <label className="order-field">{t('linksMedium')}
            <select value={config.medium} onChange={(event) => change({ medium: event.target.value as LinkConfig['medium'] })}>
              {Object.entries(linkMedia).map(([id, label]) => <option value={id} key={id}>{label[language]}</option>)}
            </select>
          </label>
          <label className="order-field workspace-full">{t('linksName')}
            <input value={config.name} maxLength={72} dir="auto" onChange={(event) => change({ name: event.target.value })} />
          </label>
          <label className="order-field workspace-full">{t('linksReferral')}
            <select value={config.referral} onChange={(event) => change({ referral: event.target.value as LinkConfig['referral'] })}>
              <option value="">{t('linksNoReferral')}</option>
              {referralCodes.filter((id) => {
                const referral = resolveReferral(id)
                return referral && (!config.campaign || referral.campaign.id === config.campaign)
              }).map((id) => <option value={id} key={id}>{referralLabels[id][language]}</option>)}
            </select>
          </label>
        </div>
      </section>
      <section className="report-panel workspace-preview-card" aria-labelledby="links-preview-heading">
        <h2 id="links-preview-heading">{t('linksPreview')}</h2>
        {url ? <>
          <p className="workspace-url" data-testid="campaign-url" dir="ltr">{url}</p>
          {isLoopback(url) && <p className="report-note">{t('workspaceLocalLink')}</p>}
        </> : <p className="report-note">{t('linksInvalid')}</p>}
        <div className="report-actions">
          <button type="button" className="button button--forest" disabled={!url || current} onClick={generate}>{t('linksGenerate')}</button>
          {url && current && <>
            <button type="button" className="button button--line" onClick={() => void clipboard.copy(url)}>{t('linksCopy')}</button>
            <a className="button button--line" href={url} target="_blank" rel="noopener noreferrer">{t('linksOpen')}</a>
            <Link className="button button--line" to="/marketing/qr" state={{ url, campaign: config.campaign }}>{t('qrGenerate')}</Link>
            <button type="button" className="button button--line" onClick={() => void save()}>{t('linksSave')}</button>
          </>}
        </div>
        {notice && <p role="status">{t(notice)}</p>}
        <WorkspaceCopyResult result={clipboard.result} />
      </section>
    </div>
    {saved.length > 0 && <section className="report-panel saved-links" aria-labelledby="saved-links-heading">
      <h2 id="saved-links-heading">{t('linksHistory')}</h2>
      <ul role="list">{saved.map((item, index) => <li key={index}>
        <button type="button" className="button button--line" onClick={() => change(item)}>
          <bdi>{item.name}</bdi> · {siteDestinations[item.destination].label[language]} · {linkSources[item.source][language]}
        </button>
      </li>)}</ul>
    </section>}
  </WorkspaceShell>
}
