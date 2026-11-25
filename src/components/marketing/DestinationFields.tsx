import { useLanguage } from '../../context/LanguageContext'
import { campaigns } from '../../data/campaigns'
import { siteDestinations, type Destination } from '../../data/marketingTools'
import { menuCatalog } from '../../data/menu'

export type SelectedDestination = Destination | 'custom'

export function DestinationFields({ destination, campaign, dish, choose, setCampaign, setDish, custom = false, alwaysCampaign = false }: {
  destination: SelectedDestination; campaign: string; dish: string; custom?: boolean; alwaysCampaign?: boolean
  choose: (destination: SelectedDestination) => void; setCampaign: (id: string) => void; setDish: (slug: string) => void
}) {
  const { t, language } = useLanguage()
  return <>
    <label className="order-field">{t('linksDestination')}
      <select value={destination} onChange={(event) => choose(event.target.value as SelectedDestination)}>
        {Object.entries(siteDestinations).map(([id, entry]) => <option key={id} value={id}>{entry.label[language]}</option>)}
        {custom && <option value="custom">{t('qrCustom')}</option>}
      </select>
    </label>
    {(alwaysCampaign || destination === 'campaign') && <label className="order-field">{t('linksCampaign')}
      <select value={campaign} onChange={(event) => setCampaign(event.target.value)}>
        {destination !== 'campaign' && <option value="">{t('linksNoCampaign')}</option>}
        {campaigns.map((item) => <option key={item.id} value={item.id}>{item.name[language]}</option>)}
      </select>
    </label>}
    {destination === 'dish' && <label className="order-field workspace-full">{t('linksDish')}
      <select value={dish} onChange={(event) => setDish(event.target.value)}>
        {menuCatalog.filter(({ available }) => available).map((item) => <option key={item.slug} value={item.slug}>{language === 'ar' ? item.nameAr : item.nameEn}</option>)}
      </select>
    </label>}
  </>
}
