import type { Localized } from '../types'
import { approvedPublicOrigin } from './publicOrigin'

type RestaurantDetails = {
  address: Localized | null
  hours: Localized | null
  phone: string | null
  email: string | null
  instagram: string | null
  facebook: string | null
}

// Populate when Maramia approves UAE contact details for publication.
export const restaurantDetails: RestaurantDetails = {
  address: null,
  hours: null,
  phone: null,
  email: null,
  instagram: null,
  facebook: null,
}

export const ramallahReferences = {
  instagram: 'https://www.instagram.com/maramia.palestine/',
  facebook: 'https://www.facebook.com/MaramiaCafeAndRestaurants',
  lacasa: 'https://lacasamall.ps/ar/dining/maramia/',
}

// Set an approved public origin at build time. Local demos share their current origin.
export const publicSiteUrl: string | undefined = import.meta.env.VITE_PUBLIC_SITE_URL

export function publicCampaignUrl(path: string) {
  return new URL(path, approvedPublicOrigin(publicSiteUrl) ?? window.location.origin).href
}
