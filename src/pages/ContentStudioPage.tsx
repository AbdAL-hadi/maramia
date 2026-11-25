import { Download, RotateCcw } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { GraphicPreview, type CanvasStatus } from '../components/marketing/GraphicPreview'
import { useWorkspaceCopy, WorkspaceCopyResult } from '../components/marketing/WorkspaceCopy'
import { WorkspaceShell } from '../components/marketing/WorkspaceShell'
import { useLanguage } from '../context/LanguageContext'
import { campaignPath, campaigns, findCampaign } from '../data/campaigns'
import { downloadPng } from '../data/canvasGraphics'
import { graphicFormats, graphicImages, graphicTemplates, type GraphicFormat, type Template } from '../data/graphicTemplates'
import { recordEvent } from '../data/marketingAnalytics'
import { publicCampaignUrl } from '../data/restaurant'
import { drawStudioGraphic, type StudioCopy } from '../data/studioCanvas'
import type { CopyKey } from '../i18n/copy'
import type { Language } from '../types'

function templateFields(template: Template) {
  return {
    image: template.image, background: template.color, code: template.code ?? '', campaign: template.campaign,
    ar: { headline: template.headline.ar, text: template.text.ar, action: template.action.ar },
    en: { headline: template.headline.en, text: template.text.en, action: template.action.en },
  }
}

export default function ContentStudioPage() {
  const { t, language } = useLanguage()
  const [graphicLanguage, setGraphicLanguage] = useState<Language>(language)
  const [template, setTemplate] = useState(graphicTemplates[0])
  const [format, setFormat] = useState<GraphicFormat>('post')
  const [fields, setFields] = useState(() => templateFields(template))
  const [status, setStatus] = useState<CanvasStatus>('loading')
  const [message, setMessage] = useState<CopyKey | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const clipboard = useWorkspaceCopy()
  const dimensions = graphicFormats[format]
  const campaign = findCampaign(fields.campaign)
  const path = campaign ? campaignPath(campaign) : template.id === 'rewards' ? '/loyalty' : '/offers'
  const draft = fields[graphicLanguage]
  const draw = useCallback((ctx: CanvasRenderingContext2D) => (
    drawStudioGraphic(ctx, template, fields.image, fields.background, fields.code, draft, graphicLanguage)
  ), [template, fields.image, fields.background, fields.code, draft, graphicLanguage])

  function update(next: Partial<typeof fields>) {
    setFields((previous) => ({ ...previous, ...next }))
    setMessage(null)
  }

  function loadTemplate(next: Template) {
    setTemplate(next)
    setFields(templateFields(next))
    setMessage(null)
    clipboard.clearCopy()
  }

  function setCampaign(id: string) {
    const selected = findCampaign(id)
    if (!selected) { update({ campaign: '', code: '' }); return }
    update({
      campaign: id, code: selected.code ?? '',
      ar: { ...fields.ar, headline: selected.name.ar, text: selected.description.ar.slice(0, 150) },
      en: { ...fields.en, headline: selected.name.en, text: selected.description.en.slice(0, 150) },
    })
  }

  function edit(field: keyof StudioCopy, value: string) {
    update({ [graphicLanguage]: { ...draft, [field]: value } })
  }

  async function download() {
    if (!canvas.current || status !== 'ready') return
    try {
      await downloadPng(canvas.current, 'maramia-' + template.id + '-' + format + '-' + graphicLanguage + '.png')
      void recordEvent('graphic_generated', { campaignId: campaign?.id })
      setMessage('workspaceExported')
    } catch {
      setMessage('workspaceRenderError')
    }
  }

  return <WorkspaceShell title="studioTitle" intro="studioIntro">
    <div className="workspace-grid">
      <section className="report-panel workspace-controls" aria-labelledby="studio-settings">
        <h2 id="studio-settings">{t('workspaceCustomize')}</h2>
        <div className="workspace-fields">
          <label className="order-field">{t('studioTemplate')}
            <select value={template.id} onChange={(event) => loadTemplate(graphicTemplates.find((item) => item.id === event.target.value) ?? graphicTemplates[0])}>
              {graphicTemplates.map((item) => <option key={item.id} value={item.id}>{item.name[language]}</option>)}
            </select>
          </label>
          <label className="order-field">{t('studioFormat')}
            <select value={format} onChange={(event) => { setFormat(event.target.value as GraphicFormat); setMessage(null) }}>
              {Object.entries(graphicFormats).map(([id, entry]) => <option value={id} key={id}>{entry.label[language]}</option>)}
            </select>
          </label>
          <label className="order-field">{t('graphicLanguage')}
            <select value={graphicLanguage} onChange={(event) => { setGraphicLanguage(event.target.value as Language); setMessage(null) }}>
              <option value="ar" lang="ar">العربية</option><option value="en" lang="en">English</option>
            </select>
          </label>
          <label className="order-field">{t('studioImage')}
            <select value={fields.image} onChange={(event) => update({ image: event.target.value as keyof typeof graphicImages })}>
              {Object.entries(graphicImages).map(([id, image]) => <option key={id} value={id}>{image.label[language]}</option>)}
            </select>
          </label>
          <label className="order-field">{t('linksCampaign')}
            <select value={fields.campaign} onChange={(event) => setCampaign(event.target.value)}>
              <option value="">{t('linksNoCampaign')}</option>
              {campaigns.map((item) => <option key={item.id} value={item.id}>{item.name[language]}</option>)}
            </select>
          </label>
          <label className="order-field">{t('studioBackground')}
            <input type="color" value={fields.background} onChange={(event) => update({ background: event.target.value })} />
          </label>
          <label className="order-field workspace-full">{t('studioHeadline')}
            <input dir={graphicLanguage === 'ar' ? 'rtl' : 'ltr'} value={draft.headline} maxLength={66} onChange={(event) => edit('headline', event.target.value)} />
          </label>
          <label className="order-field workspace-full">{t('studioText')}
            <textarea dir={graphicLanguage === 'ar' ? 'rtl' : 'ltr'} rows={3} maxLength={150} value={draft.text} onChange={(event) => edit('text', event.target.value)} />
          </label>
          <label className="order-field">{t('studioCode')}
            <input dir="ltr" value={fields.code} maxLength={24} onChange={(event) => update({ code: event.target.value })} />
          </label>
          <label className="order-field">{t('studioAction')}
            <input dir={graphicLanguage === 'ar' ? 'rtl' : 'ltr'} maxLength={45} value={draft.action} onChange={(event) => edit('action', event.target.value)} />
          </label>
        </div>
        <button type="button" className="button button--line" onClick={() => loadTemplate(template)}><RotateCcw size={16} aria-hidden="true" />{t('workspaceReset')}</button>
      </section>
      <section className="report-panel workspace-preview-card" aria-labelledby="studio-preview-heading">
        <div className="workspace-preview-header">
          <h2 id="studio-preview-heading">{t('workspacePreview')}</h2>
          <bdi>{dimensions.width} × {dimensions.height} px</bdi>
        </div>
        <div className={'graphic-stage graphic-stage-' + format}>
          <GraphicPreview canvas={canvas} width={dimensions.width} height={dimensions.height} draw={draw} status={status} setStatus={setStatus}
            locale={graphicLanguage} label={[draft.headline, draft.text, fields.code, draft.action].filter(Boolean).join(' · ')} />
        </div>
        <div className="report-actions">
          <button type="button" className="button button--forest" disabled={status !== 'ready'} onClick={() => void download()}>
            <Download size={18} aria-hidden="true" />{t('workspaceDownload')}
          </button>
          <button type="button" className="button button--line" onClick={() => void clipboard.copy([draft.headline, draft.text, fields.code, draft.action].filter(Boolean).join('\n\n'))}>{t('workspaceCaption')}</button>
          <button type="button" className="button button--line" onClick={() => void clipboard.copy(template.hashtags[graphicLanguage])}>{t('workspaceHashtags')}</button>
          <button type="button" className="button button--line" onClick={() => void clipboard.copy(publicCampaignUrl(path))}>{t('workspaceCampaignLink')}</button>
        </div>
        {message && <p role="status">{t(message)}</p>}
        <WorkspaceCopyResult result={clipboard.result} />
      </section>
    </div>
  </WorkspaceShell>
}
