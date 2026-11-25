import type { Localized } from '../types'
import dishImage from '../assets/menu/chicken-musakhan.webp'
import tableImage from '../assets/hero.webp'
import familyImage from '../assets/seating/family.webp'
import businessImage from '../assets/interior.webp'
import breadImage from '../assets/story.webp'
import teaImage from '../assets/hospitality.webp'
import terraceImage from '../assets/seating/terrace.webp'
import privateImage from '../assets/seating/private.webp'

export const graphicImages = {
  musakhan: { src: dishImage, label: { ar: 'المسخّن الفلسطيني', en: 'Chicken Musakhan' } },
  table: { src: tableImage, label: { ar: 'المائدة المشتركة', en: 'Shared Table' } },
  family: { src: familyImage, label: { ar: 'الجلسة العائليّة', en: 'Family Seating' } },
  interior: { src: businessImage, label: { ar: 'قاعة الطعام', en: 'Main Dining Room' } },
  taboon: { src: breadImage, label: { ar: 'خبز الطابون', en: 'Taboon Bread' } },
  tea: { src: teaImage, label: { ar: 'شاي الميرمية', en: 'Sage Tea' } },
  terrace: { src: terraceImage, label: { ar: 'التراس الخارجي', en: 'Outdoor Terrace' } },
  private: { src: privateImage, label: { ar: 'جلسة خاصّة', en: 'Private Dining' } },
} as const

export const graphicFormats = {
  post: { width: 1080, height: 1080, label: { ar: 'منشور إنستغرام · ١:١', en: 'Instagram Post · 1:1' } },
  story: { width: 1080, height: 1920, label: { ar: 'قصّة إنستغرام · ٩:١٦', en: 'Instagram Story · 9:16' } },
  banner: { width: 1920, height: 1080, label: { ar: 'لافتة ترويجيّة · ١٦:٩', en: 'Promotional Banner · 16:9' } },
} as const
export type GraphicFormat = keyof typeof graphicFormats

export type Template = {
  id: string; name: Localized; headline: Localized; text: Localized; action: Localized
  image: keyof typeof graphicImages; color: string; layout: 'arch' | 'split' | 'overlay'
  campaign: string; code?: string; hashtags: Localized
}

export const graphicTemplates: readonly Template[] = [
  {
    id: 'signature', name: { ar: 'الطبق المميّز', en: 'Signature Dish' },
    headline: { ar: 'المسخّن الفلسطيني', en: 'Chicken Musakhan' },
    text: { ar: 'خبز طابون وسماق وبصل، على مائدة للمشاركة.', en: 'Taboon bread, sumac, and onions on a table made for sharing.' },
    action: { ar: 'اكتشفوا القائمة', en: 'Explore the menu' },
    image: 'musakhan', color: '#202f24', layout: 'arch', campaign: 'taste', hashtags: { ar: '#مرامية #مسخن #مطبخ_فلسطيني', en: '#MaramiaUAE #Musakhan #PalestinianFood' },
  },
  {
    id: 'offer', name: { ar: 'عرض خاصّ', en: 'Special Offer' },
    headline: { ar: 'أهلًا بكم في مرامية', en: 'Welcome to Maramia' },
    text: { ar: 'وفّروا ٢٠ درهمًا عند طلب تجريبي بقيمة ١٠٠ درهم أو أكثر.', en: 'Save AED 20 on a demo food and drinks subtotal of AED 100 or more.' },
    action: { ar: 'استكشفوا العرض', en: 'See the offer' },
    image: 'table', color: '#efe2c5', layout: 'split', campaign: 'welcome', code: 'WELCOME20', hashtags: { ar: '#مرامية #عروض_الطعام #الإمارات', en: '#MaramiaUAE #DiningOffer #UAEFood' },
  },
  {
    id: 'family', name: { ar: 'المائدة العائليّة', en: 'Family Dining' },
    headline: { ar: 'مائدة تجمع العائلة', en: 'A table for the family' },
    text: { ar: 'مقبّلات مشتركة ونكهات فلسطينية تجمع الأحبّة.', en: 'Shared mezze and Palestinian favourites for everyone at the table.' },
    action: { ar: 'استكشفوا الجلسات', en: 'Find your table' },
    image: 'family', color: '#514437', layout: 'overlay', campaign: 'family', hashtags: { ar: '#مرامية #مائدة_عائلية #ضيافة', en: '#MaramiaUAE #FamilyDining #SharedTable' },
  },
  {
    id: 'business', name: { ar: 'غداء عمل', en: 'Business Lunch' },
    headline: { ar: 'فسحة غداء بين المواعيد', en: 'Make time for lunch' },
    text: { ar: 'تجربة غداء مقترحة تبدأ بالفتّوش وتنتهي بقهوة فلسطينية.', en: 'A lunch idea that starts with fattoush and ends with Palestinian coffee.' },
    action: { ar: 'اكتشفوا تجربة الغداء', en: 'Explore business lunch' },
    image: 'interior', color: '#344b36', layout: 'split', campaign: 'business', hashtags: { ar: '#مرامية #غداء_عمل #قهوة_فلسطينية', en: '#MaramiaUAE #BusinessLunch #PalestinianCoffee' },
  },
  {
    id: 'palestine', name: { ar: 'تجربة المطبخ الفلسطيني', en: 'Palestinian Food Experience' },
    headline: { ar: 'نكهة من فلسطين', en: 'A taste of Palestine' },
    text: { ar: 'من خبز الطابون الدافئ إلى المفتول والكنافة النابلسيّة.', en: 'From warm taboon bread to Palestinian maftoul and Nabulsi knafeh.' },
    action: { ar: 'اكتشفوا النكهات', en: 'Discover the dishes' },
    image: 'taboon', color: '#d9bf96', layout: 'arch', campaign: 'taste', hashtags: { ar: '#مرامية #نكهة_من_فلسطين #خبز_طابون', en: '#MaramiaUAE #TasteOfPalestine #Taboon' },
  },
  {
    id: 'rewards', name: { ar: 'مكافآت ميرمية', en: 'Maramia Rewards' },
    headline: { ar: 'مكافآت ميرمية', en: 'Maramia Rewards' },
    text: { ar: 'انضمّوا إلى البرنامج التجريبي واكسبوا نقاطًا مع الطلبات المكتملة.', en: 'Join the demo programme and earn points on completed orders.' },
    action: { ar: 'اكتشفوا المكافآت', en: 'Discover rewards' },
    image: 'tea', color: '#20392d', layout: 'overlay', campaign: '', hashtags: { ar: '#مرامية #مكافآت_ميرمية #شاي_الميرمية', en: '#MaramiaUAE #MaramiaRewards #SageTea' },
  },
]

export const giftValues = [50, 100, 200, 500] as const
export const giftDesigns = [
  { id: 'birthday', name: { ar: 'عيد ميلاد', en: 'Birthday' }, image: 'table', color: '#633e3c' },
  { id: 'anniversary', name: { ar: 'ذكرى سنويّة', en: 'Anniversary' }, image: 'private', color: '#47382c' },
  { id: 'family', name: { ar: 'لقاء عائلي', en: 'Family Occasion' }, image: 'family', color: '#344b36' },
  { id: 'ramadan', name: { ar: 'رمضان والعيد', en: 'Ramadan and Eid' }, image: 'terrace', color: '#263a45' },
  { id: 'thanks', name: { ar: 'تقدير وامتنان', en: 'Appreciation' }, image: 'tea', color: '#23392d' },
] as const
