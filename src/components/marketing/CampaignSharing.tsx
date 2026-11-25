import { Clipboard, MessageCircle, Printer, Share2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { campaignPath, type Campaign } from '../../data/campaigns'
import { recordEvent } from '../../data/marketingAnalytics'
import { publicCampaignUrl } from '../../data/restaurant'

export function CampaignSharing({ campaign, path = campaignPath(campaign), code }: { campaign: Campaign; path?: string; code?: string | null }) {
  const { language, t } = useLanguage()
  const url = publicCampaignUrl(path)
  const title = campaign.name[language] + ' · Maramia UAE'
  const text = [campaign.description[language], code].filter(Boolean).join(' · ')
  const [status, setStatus] = useState<'copied' | 'fallback' | null>(null)
  const link = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (status === 'fallback') {
      link.current?.focus()
      link.current?.select()
    }
  }, [status])

  async function copyLink() {
    try {
      if (!navigator.clipboard) throw new Error()
      await navigator.clipboard.writeText(url)
      setStatus('copied')
    } catch {
      setStatus('fallback')
      link.current?.focus()
      link.current?.select()
    }
  }

  async function share() {
    void recordEvent('share', { campaignId: campaign.id, method: 'native' })
    if (typeof navigator.share !== 'function') {
      await copyLink()
      return
    }
    try {
      await navigator.share({ title, text, url })
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) await copyLink()
    }
  }

  return (
    <div className="campaign-sharing">
      <div className="editorial-actions">
        <button type="button" className="button button--forest" onClick={() => void share()}><Share2 size={17} aria-hidden="true" />{t('campaignShare')}</button>
        <button type="button" className="button button--line" onClick={() => {
          void recordEvent('share', { campaignId: campaign.id, method: 'copy' })
          void copyLink()
        }}><Clipboard size={17} aria-hidden="true" />{t('campaignCopy')}</button>
        <a className="button button--line" href={'https://wa.me/?text=' + encodeURIComponent([title, text, url].join('\n'))} target="_blank" rel="noopener noreferrer"
          onClick={() => void recordEvent('share', { campaignId: campaign.id, method: 'whatsapp' })}>
          <MessageCircle size={17} aria-hidden="true" />{t('campaignWhatsApp')}
        </a>
        <button type="button" className="button button--line" onClick={() => {
          void recordEvent('share', { campaignId: campaign.id, method: 'print' })
          window.print()
        }}><Printer size={17} aria-hidden="true" />{t('campaignPrint')}</button>
      </div>
      {status === 'fallback' && <label className="campaign-link-field">
        {t('campaignShareLink')}<input ref={link} value={url} readOnly dir="ltr" />
      </label>}
      <p role="status">{status === 'copied' ? t('campaignLinkCopied') : status === 'fallback' ? t('campaignLinkFallback') : ''}</p>
    </div>
  )
}
