import type { Localized } from '../types'
import { giftValues } from './graphicTemplates'
import { welcomePoints } from './loyalty'
import { menuCatalog } from './menu'
import { aedCurrency } from './menuFilters'
import { featuredPromotion, pickupSlots } from './ordering'
import { reservationSettings } from './reservations'

export type FaqEntry = { id: string; question: Localized; answer: Localized; path: string; link: Localized }

const numbers = (value: number) => ({ ar: value.toLocaleString('ar-AE'), en: value.toLocaleString('en-AE') })
const menuCount = numbers(menuCatalog.filter((dish) => dish.available).length)
const guests = numbers(reservationSettings.maxGuests)
const days = numbers(reservationSettings.horizonDays)
const slots = numbers(Object.keys(pickupSlots).length)
const welcome = numbers(welcomePoints)
const giftList = { ar: giftValues.map((value) => aedCurrency.ar.format(value)).join('، '), en: giftValues.map((value) => aedCurrency.en.format(value)).join(', ') }

export const faqs: readonly FaqEntry[] = [
  {
    id: 'menu', path: '/menu', link: { ar: 'تصفّحوا القائمة', en: 'Browse the Menu' },
    question: { ar: 'كيف أجد أطباقًا تناسب تفضيلاتي؟', en: 'How do I find dishes for my food preferences?' },
    answer: { ar: 'تضمّ القائمة ' + menuCount.ar + ' صنفًا. استخدموا البحث أو فلتر الأطباق النباتية، وافتحوا تفاصيل الطبق لمراجعة المكوّنات المدرجة. تحتاج معلومات الحساسية إلى تأكيد من المطعم قبل الطلب الفعلي.',
      en: 'The menu has ' + menuCount.en + ' items. Use search or the vegetarian filter, then open a dish for its listed ingredients. Confirm allergy information with a restaurant before placing any real order.' },
  },
  {
    id: 'order', path: '/order', link: { ar: 'اذهبوا إلى الطلب', en: 'Go to Ordering' },
    question: { ar: 'كيف أقدّم طلبًا تجريبيًا وأتابعه؟', en: 'How do I place and track a demo order?' },
    answer: { ar: 'اختاروا الأطباق وأضيفوها إلى السلّة، ثم تابعوا إلى صفحة الدفع التجريبي. بعد الحفظ، يظهر رقم الطلب ورابط التتبّع في هذا المتصفّح.',
      en: 'Choose dishes, add them to the cart, and proceed to the demo checkout. After saving, use the reference and tracking link shown in this browser.' },
  },
  {
    id: 'fulfilment', path: '/order', link: { ar: 'عرض خيارات الطلب', en: 'See Ordering Options' },
    question: { ar: 'ما الفرق بين التوصيل والاستلام؟', en: 'How do delivery and pickup work?' },
    answer: { ar: 'في الطلب التجريبي، يحدّد اختيار الإمارة رسوم التوصيل والحدّ الأدنى. يتيح الاستلام ' + slots.ar + ' خيارات توقيت تجريبية. تفاصيل الخدمة الفعليّة بانتظار التأكيد.',
      en: 'In demo checkout, choosing an emirate sets the delivery fee and minimum. Pickup offers ' + slots.en + ' demo time choices. Live service details are pending confirmation.' },
  },
  {
    id: 'payment', path: '/order', link: { ar: 'تجربة الدفع', en: 'Explore Demo Checkout' },
    question: { ar: 'هل يُخصم مبلغ عند تجربة الدفع؟', en: 'Does demo checkout charge a payment?' },
    answer: { ar: 'الدفع النقدي والبطاقة وApple Pay خيارات محاكاة. تُحفظ تفاصيل الطلب التجريبي في هذا المتصفّح.',
      en: 'Cash, card, and Apple Pay are simulated choices. Your saved demo order is available in this browser.' },
  },
  {
    id: 'reservation', path: '/reservation', link: { ar: 'احجزوا طاولة تجريبية', en: 'Book a Demo Table' },
    question: { ar: 'كيف أختار موعدًا وطاولة؟', en: 'How do I reserve a table?' },
    answer: { ar: 'اختاروا موعدًا بتوقيت دبي خلال ' + days.ar + ' يومًا، ومجموعة تصل إلى ' + guests.ar + ' ضيفًا. يعرض نموذج الحجز الطاولات المتاحة في المحاكاة.',
      en: 'Choose a time in Dubai within ' + days.en + ' days and a party of up to ' + guests.en + '. The booking wizard shows simulated table availability.' },
  },
  {
    id: 'manage', path: '/reservation/manage', link: { ar: 'إدارة الحجوزات', en: 'Manage Reservations' },
    question: { ar: 'كيف يمكنني تعديل أو إلغاء الحجز؟', en: 'How do I modify or cancel a reservation?' },
    answer: { ar: 'افتحوا إدارة الحجوزات من المتصفّح نفسه قبل موعد الزيارة. يمكنكم تعديل الحجز إذا توافرت طاولة، أو إلغاؤه.',
      en: 'Open Manage Reservations in the same browser before the scheduled visit. You can change the booking subject to table availability, or cancel it.' },
  },
  {
    id: 'experiences', path: '/uae#dining-experiences', link: { ar: 'استعرضوا تجارب المائدة', en: 'Explore Dining Experiences' },
    question: { ar: 'أين يمكنني استكشاف تجارب الطعام والجلسات الخاصة؟', en: 'Where can I explore dining experiences and private occasions?' },
    answer: { ar: 'تعرّفوا إلى الجلسات والمناسبات المقترحة في صفحة المطعم. تملأ روابط التجارب تفضيل الجلسة أو المناسبة في نموذج الحجز التجريبي.',
      en: 'See proposed seating and occasions on the restaurant page. Experience links can preselect seating or an occasion in the demo booking wizard.' },
  },
  {
    id: 'rewards', path: '/loyalty', link: { ar: 'عرض المكافآت', en: 'View Maramia Rewards' },
    question: { ar: 'كيف تعمل مكافآت ميرمية؟', en: 'How do I earn and use Maramia Rewards?' },
    answer: { ar: 'تحصلون على ' + welcome.ar + ' نقطة عند إنشاء العضوية المحلية. تُكسب الطلبات المكتملة نقاطًا، ويمكن اختيار مكافأة واحدة أو رمز ترويجي واحد عند الدفع التجريبي.',
      en: 'Joining in this browser gives ' + welcome.en + ' welcome points. Completed orders earn qualifying points. At demo checkout, choose one reward or one promo code.' },
  },
  {
    id: 'promos', path: '/offers', link: { ar: 'عرض العروض الحالية', en: 'See Current Offers' },
    question: { ar: 'أين أستخدم الرموز الترويجية؟', en: 'Where do I enter a promo code?' },
    answer: { ar: 'أدخلوا الرمز في صفحة الدفع التجريبي. تعرض الصفحة شروط الحملة والحدّ الأدنى عند الحاجة. مثال على رمز تجريبي: ' + featuredPromotion + '.',
      en: 'Enter the code at demo checkout. Campaign dates and minimums apply where indicated. ' + featuredPromotion + ' is an example demo code.' },
  },
  {
    id: 'gifts', path: '/gift-cards', link: { ar: 'صمّموا بطاقة هديّة', en: 'Design a Gift Card' },
    question: { ar: 'هل يمكنني استخدام بطاقة هديّة في المطعم؟', en: 'Can I redeem a gift card at the restaurant?' },
    answer: { ar: 'يمكنكم معاينة بطاقة بقيمة عرض ' + giftList.ar + ' وتنزيلها أو طباعتها. هذه البطاقات التجريبية بلا قيمة نقدية.',
      en: 'Preview a card with a display value of ' + giftList.en + ', then download or print it. These demo cards have no monetary or redemption value.' },
  },
]
