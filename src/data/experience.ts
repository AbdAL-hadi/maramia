import bread from '../assets/story.webp'
import interior from '../assets/interior.webp'
import tea from '../assets/hospitality.webp'
import type { Localized } from '../types'

type Moment = {
  label: Localized
  title: Localized
  text: Localized
  alt: Localized
  image: string
}

export const moments: Moment[] = [
  {
    label: { ar: 'شاي الميرمية', en: 'Sage Tea' },
    title: { ar: 'فنجان ميرمية على مهل', en: 'Stay for a glass of sage tea' },
    text: { ar: 'تتصاعد رائحة الميرمية من الكأس، وتمنحنا لحظة هادئة لمواصلة الحديث بعد الطعام.', en: 'The scent of sage rises from the glass, a quiet invitation to let the conversation carry on after the meal.' },
    alt: { ar: 'يُصب شاي الميرمية في كأس زجاجي', en: 'Sage tea being poured into a glass' },
    image: tea,
  },
  {
    label: { ar: 'خبز الطابون', en: 'Taboon Bread' },
    title: { ar: 'خبزٌ دافئ نتقاسمه', en: 'Bread to break together' },
    text: { ar: 'يصل خبز الطابون دافئًا إلى وسط المائدة. نتقاسمه ونغمسه في زيت الزيتون قبل أن تصل بقية الأطباق.', en: 'Warm taboon bread lands at the center of the table, ready to tear and dip in olive oil while the other dishes arrive.' },
    alt: { ar: 'يدان تتقاسمان خبز الطابون', en: 'Hands breaking taboon bread' },
    image: bread,
  },
  {
    label: { ar: 'المكان', en: 'The Space' },
    title: { ar: 'أقواس حجرية ومقاعد للجميع', en: 'A place to settle in' },
    text: { ar: 'يجتمع الحجر الفاتح وألوان الميرمية والمنسوجات المستوحاة من التطريز الفلسطيني حول طاولات واسعة للمشاركة.', en: 'Pale stone, sage tones, and textiles inspired by Palestinian embroidery frame tables made for sharing.' },
    alt: { ar: 'صورة توضيحية لقاعة طعام بأقواس حجرية', en: 'Illustration of a dining room with stone arches' },
    image: interior,
  },
]
