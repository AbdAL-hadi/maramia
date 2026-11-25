import type { CopyKey } from '../i18n/copy'

export const navigation = [
  { label: 'home', to: '/' },
  { label: 'menu', to: '/menu' },
  { label: 'order', to: '/order' },
  { label: 'story', to: '/about' },
  { label: 'uae', to: '/uae' },
  { label: 'offers', to: '/offers' },
  { label: 'rewardsName', to: '/loyalty' },
  { label: 'contact', to: '/contact' },
] as const satisfies ReadonlyArray<{ label: CopyKey; to: string }>

export const supportNavigation = [
  { label: 'contact', to: '/contact' },
  { label: 'faqTitle', to: '/faq' },
  { label: 'giftTitle', to: '/gift-cards' },
  { label: 'feedbackTitle', to: '/feedback' },
] as const satisfies ReadonlyArray<{ label: CopyKey; to: string }>

