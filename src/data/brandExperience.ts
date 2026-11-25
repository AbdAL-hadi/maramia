import entrance from '../assets/experience/entrance.webp'
import interior from '../assets/interior.webp'
import family from '../assets/seating/family.webp'
import terrace from '../assets/seating/terrace.webp'
import privateDining from '../assets/seating/private.webp'
import table from '../assets/hero.webp'
import bread from '../assets/story.webp'
import tea from '../assets/hospitality.webp'
import type { Localized } from '../types'
import type { Occasion, SeatingZone } from '../types/reservation'
import { menuCatalog } from './menu'

export const experienceImages = { entrance, interior, family, terrace, privateDining, table, bread, tea }

type Hotspot = {
  id: string
  x: number
  y: number
  title: Localized
  description: Localized
}

type TourScene = {
  id: string
  image: string
  title: Localized
  description: Localized
  hotspots: readonly Hotspot[]
  action: 'areas' | 'menu' | SeatingZone
}

export const tourScenes: readonly TourScene[] = [
  {
    id: 'entrance', image: entrance, action: 'areas',
    title: { ar: 'المدخل والاستقبال', en: 'Entrance and Reception' },
    description: { ar: 'تستقبلك شجرة زيتون وملمس الحجر الدافئ، ويقودك القوس نحو قاعة الطعام.', en: 'An olive tree and warm stone greet you at the entrance. Follow the arch into the dining room.' },
    hotspots: [
      {
        id: 'olive-tree', x: 21, y: 48,
        title: { ar: 'شجرة الزيتون', en: 'Olive Tree' },
        description: { ar: 'تستحضر شجرة الزيتون المائدة الفلسطينية، وتمنح المدخل ظلًّا أخضر هادئًا.', en: 'The olive tree recalls the Palestinian table and brings a quiet patch of green to the entrance.' },
      },
      {
        id: 'reception-desk', x: 76, y: 67,
        title: { ar: 'منضدة الاستقبال', en: 'Reception Desk' },
        description: { ar: 'تجمع منضدة الاستقبال بين الحجر والإضاءة الخافتة، وتترك الممر مفتوحًا نحو قاعة الطعام.', en: 'A softly lit stone desk anchors the reception area and leaves a clear path into the dining room.' },
      },
    ],
  },
  {
    id: 'main', image: interior, action: 'main',
    title: { ar: 'قاعة الطعام الرئيسية', en: 'Main Dining Area' },
    description: { ar: 'تتكرّر الأقواس الحجرية حول موائد صغيرة ومقاعد بألوان الميرمية.', en: 'Stone arches frame smaller tables and sage-green seating in the heart of the restaurant.' },
    hotspots: [
      {
        id: 'stone-arches', x: 52, y: 28,
        title: { ar: 'الأقواس الحجرية', en: 'Stone Arches' },
        description: { ar: 'تمنح الأقواس القاعة إيقاعها وتترك خطوط النظر مفتوحة عبرها.', en: 'Repeated arches give the room its rhythm and keep sightlines open between tables.' },
      },
      {
        id: 'woven-detail', x: 21, y: 76,
        title: { ar: 'تفاصيل منسوجة', en: 'Woven Details' },
        description: { ar: 'تظهر لمسات مستوحاة من التطريز الفلسطيني في مفارش الموائد والوسائد.', en: 'Table runners and cushions carry details inspired by Palestinian embroidery.' },
      },
    ],
  },
  {
    id: 'family', image: family, action: 'family',
    title: { ar: 'الجلسات العائلية', en: 'Family Seating' },
    description: { ar: 'مائدة ممتدّة ومقعد مريح يتركان مساحة للأطباق وللأحاديث العائلية.', en: 'A longer table and a generous banquette make room for shared plates and family conversation.' },
    hotspots: [
      {
        id: 'family-banquette', x: 22, y: 56,
        title: { ar: 'مقاعد عائلية متّصلة', en: 'Family Banquette' },
        description: { ar: 'مقعد طويل بلون الزيتون يتيح للجالسين البقاء بالقرب من بعضهم حول المائدة.', en: 'The olive-green banquette keeps guests close enough to pass dishes and talk across the table.' },
      },
      {
        id: 'family-place-settings', x: 66, y: 74,
        title: { ar: 'ترتيب المائدة للمشاركة', en: 'A Table Set for Sharing' },
        description: { ar: 'يترك ترتيب الصحون وسط المائدة مفتوحًا لتوضع أطباق المقبّلات والمشاوي بين الجميع.', en: 'Place settings leave the centre free for mezze and grilled dishes to share.' },
      },
    ],
  },
  {
    id: 'terrace', image: terrace, action: 'terrace',
    title: { ar: 'التراس الخارجي', en: 'Outdoor Terrace' },
    description: { ar: 'جلسة في الهواء الطلق تستلهم أمسيات الإمارات، بين النباتات والفوانيس.', en: 'An open-air setting inspired by UAE evenings, with planting and warm lantern light.' },
    hotspots: [
      {
        id: 'terrace-light', x: 71, y: 39,
        title: { ar: 'ضوء الفوانيس', en: 'Lantern Light' },
        description: { ar: 'يلتقط الحجر ضوء الفوانيس حين يخفّ ضوء النهار، لتبقى الموائد محاطة بإضاءة دافئة.', en: 'As daylight fades, lanterns cast a warm glow across the stone and nearby tables.' },
      },
      {
        id: 'terrace-planting', x: 49, y: 57,
        title: { ar: 'حدائق التراس', en: 'Terrace Planting' },
        description: { ar: 'تلطّف النباتات حواف التراس وتقسّم الجلسات من دون حجبها.', en: 'Planting softens the edges of the terrace and gives each seating area some separation.' },
      },
    ],
  },
  {
    id: 'private', image: privateDining, action: 'private',
    title: { ar: 'قاعة الطعام الخاصة', en: 'Private Dining' },
    description: { ar: 'خشب دافئ وإضاءة هادئة ومائدة أقرب، في تصوّر لجلسة تناسب المناسبات.', en: 'Warm wood, low light, and a closer table suggest a quieter setting for a special occasion.' },
    hotspots: [
      {
        id: 'private-pendant', x: 56, y: 21,
        title: { ar: 'المصباح النحاسي', en: 'Brass Pendant' },
        description: { ar: 'تتركّز الإضاءة فوق المائدة، فيما يبقى الحجر المحيط أهدأ وأقل سطوعًا.', en: 'The pendant brings light down to the table while leaving the surrounding stone softly lit.' },
      },
      {
        id: 'private-setting', x: 62, y: 70,
        title: { ar: 'مائدة لجلسة أهدأ', en: 'A Quieter Table' },
        description: { ar: 'يقرب ترتيب المقاعد الضيوف من بعضهم، مع مساحة للأطباق في الوسط.', en: 'The seating brings guests closer for conversation and leaves room for dishes in the middle.' },
      },
    ],
  },
  {
    id: 'table', image: table, action: 'menu',
    title: { ar: 'المائدة الفلسطينية', en: 'Palestinian Table Experience' },
    description: { ar: 'من الخبز والحمّص إلى المسخّن، تتشكّل الوجبة من أطباق تُوضع في الوسط وتُمرّر بين الضيوف.', en: 'From bread and hummus to musakhan, the meal comes together one shared plate at a time.' },
    hotspots: [
      {
        id: 'shared-mezze', x: 15, y: 66,
        title: { ar: 'مقبّلات نتقاسمها', en: 'Shared Mezze' },
        description: { ar: 'تبدأ المائدة بالحمّص والخبز وغيره من الأطباق الصغيرة التي يسهل تمريرها بين الجميع.', en: 'Hummus, bread, and other small plates give everyone something to pass around at the start of the meal.' },
      },
      {
        id: 'sumac-table', x: 65, y: 70,
        title: { ar: 'المسخّن في وسط المائدة', en: 'Musakhan at the Centre' },
        description: { ar: 'يجتمع البصل والسماق والدجاج والخبز في طبق فلسطيني يُقدّم للمشاركة.', en: 'Onion, sumac, chicken, and bread come together in this Palestinian dish made for sharing.' },
      },
    ],
  },
]

type Experience = {
  id: string
  image: string
  title: Localized
  description: Localized
  seating: SeatingZone
  occasion: Occasion
  dishes: readonly string[]
}

export const diningExperiences: readonly Experience[] = [
  {
    id: 'family-table', image: family, seating: 'family', occasion: 'gathering',
    title: { ar: 'المائدة العائلية الفلسطينية', en: 'Palestinian Family Table' },
    description: { ar: 'مائدة تمتدّ للأهل، تبدأ بالمقبّلات وتستمرّ بأطباق تقليدية تُشارك من وسطها.', en: 'Gather the family around a longer table. Start with mezze and pass traditional dishes around as the meal unfolds.' },
    dishes: ['hummus', 'chicken-musakhan', 'palestinian-maftoul'],
  },
  {
    id: 'taste-of-palestine', image: terrace, seating: 'terrace', occasion: 'casual',
    title: { ar: 'نكهة من فلسطين', en: 'A Taste of Palestine' },
    description: { ar: 'أمسية على التراس لاستكشاف نكهات فلسطينية، من المقبّلات الباردة إلى المشاوي والكنافة.', en: 'Explore Palestinian flavours on the terrace, moving from a smoky dip to charcoal grills and warm knafeh.' },
    dishes: ['moutabal', 'mixed-grill', 'nabulsi-knafeh'],
  },
  {
    id: 'date-night', image: privateDining, seating: 'private', occasion: 'casual',
    title: { ar: 'أمسية لشخصين في مرامية', en: 'Maramia Date Night' },
    description: { ar: 'إضاءة خافتة وجلسة أهدأ لطبق مشوي وحلوى تتقاسمانها على مهل.', en: 'Low light and a quieter setting for grilled lamb, a dessert to share, and time to finish a glass of tea.' },
    dishes: ['grilled-lamb-fillet', 'nabulsi-knafeh', 'herbal-tea'],
  },
  {
    id: 'business-lunch', image: interior, seating: 'main', occasion: 'business',
    title: { ar: 'غداء عمل', en: 'Business Lunch' },
    description: { ar: 'جلسة في قاعة الطعام الرئيسية تناسب لقاءً مهنيًا، مع خيارات غداء من القائمة.', en: 'A main-dining table for conversation with colleagues, with lunch choices drawn from the menu.' },
    dishes: ['fattoush', 'shish-tawouk', 'palestinian-coffee'],
  },
]

export const celebrationOptions: readonly { occasion: Occasion; seating: SeatingZone }[] = [
  { occasion: 'birthday', seating: 'family' },
  { occasion: 'anniversary', seating: 'private' },
  { occasion: 'gathering', seating: 'family' },
  { occasion: 'business', seating: 'main' },
  { occasion: 'celebration', seating: 'private' },
]

export const storyValues = [
  { name: { ar: 'الأصالة', en: 'Authenticity' }, text: { ar: 'البدء من المكوّنات وطرق الطهو الفلسطينية.', en: 'Start with Palestinian ingredients and cooking traditions.' } },
  { name: { ar: 'الضيافة', en: 'Hospitality' }, text: { ar: 'الترحيب بالضيف ومنحه وقتًا للاستمتاع بالمائدة.', en: 'Welcome guests and give them time to enjoy the table.' } },
  { name: { ar: 'الجودة', en: 'Quality' }, text: { ar: 'العناية بالتتبيل والقوام وتوازن النكهات.', en: 'Pay attention to seasoning, texture, and balance.' } },
  { name: { ar: 'اللّمّة', en: 'Togetherness' }, text: { ar: 'إتاحة مساحة للطعام والحديث بين الجميع.', en: 'Make space for shared plates and conversation.' } },
  { name: { ar: 'التواصل الثقافي', en: 'Cultural Connection' }, text: { ar: 'إبقاء تقاليد المائدة حاضرة في تجربة معاصرة في الإمارات.', en: 'Carry Palestinian table traditions into a contemporary UAE dining experience.' } },
] satisfies readonly { name: Localized; text: Localized }[]

export const foodStories: readonly { id: string; text: Localized }[] = [
  { id: 'chicken-musakhan', text: { ar: 'يجمع خبز الطابون بين عصارة الدجاج والبصل والسماق وزيت الزيتون في لقمة واحدة.', en: 'Taboon bread catches the juices from the chicken, onions, sumac, and olive oil.' } },
  { id: 'palestinian-maftoul', text: { ar: 'حبات المفتول والحمّص واليقطين في طبق يُغرف للجميع من المائدة.', en: 'Maftoul, chickpeas, and pumpkin make a dish that can be spooned around the table.' } },
  { id: 'hummus', text: { ar: 'طبق في وسط المائدة، مع خبز يُغمس في الحمّص والطحينة والليمون.', en: 'A bowl for the centre of the table, with bread to scoop up chickpeas, tahini, and lemon.' } },
  { id: 'mixed-grill', text: { ar: 'نكهة الفحم تجمع قطع الضأن والدجاج في صحن واحد للمشاركة.', en: 'Charcoal brings lamb and chicken together on one platter for sharing.' } },
  { id: 'nabulsi-knafeh', text: { ar: 'كنافة نابلسية دافئة بالجبن والقطر، لآخر لقمة قبل الشاي.', en: 'Warm Nabulsi knafeh with cheese and syrup makes a sweet last bite before tea.' } },
]

type GalleryPhoto = { id: string; image: string; caption: Localized }

export const galleryPhotos: readonly GalleryPhoto[] = [
  { id: 'dining-room', image: interior, caption: { ar: 'أقواس الحجر والمقاعد الزيتونية في قاعة الطعام المقترحة', en: 'Stone arches and olive upholstery in the proposed dining room' } },
  { id: 'terrace', image: terrace, caption: { ar: 'تصوّر للتراس عند الغروب', en: 'The terrace concept at dusk' } },
  { id: 'private-table', image: privateDining, caption: { ar: 'مائدة خاصة تحت مصباح نحاسي', en: 'A private table under a brass pendant' } },
  { id: 'family-setting', image: family, caption: { ar: 'مائدة عائلية بتفاصيل مستوحاة من التطريز الفلسطيني', en: 'A family table with details inspired by Palestinian embroidery' } },
  { id: 'shared-food', image: table, caption: { ar: 'مسخّن ومقبّلات على مائدة للمشاركة', en: 'Musakhan and mezze on a shared table' } },
  { id: 'sage-tea', image: tea, caption: { ar: 'أوراق الميرمية وكأس الشاي', en: 'Sage leaves and a glass of tea' } },
  { id: 'entrance', image: entrance, caption: { ar: 'شجرة زيتون وحجر دافئ عند المدخل المقترح', en: 'An olive tree and warm stone at the proposed entrance' } },
]

export function findEditorialDish(id: string) {
  return menuCatalog.find((dish) => dish.id === id && dish.available)
}
