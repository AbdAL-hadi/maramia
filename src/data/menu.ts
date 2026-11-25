import type { Localized } from '../types'
import type { MenuCategory, MenuItem, MenuVariant } from '../types/menu'

export const menuSource = 'https://www.maramia.com/menus/'

export const menuCategories = {
  'cold-mezze': { ar: 'مقبلات باردة', en: 'Cold Mezze' },
  'hot-mezze': { ar: 'مقبلات ساخنة', en: 'Hot Mezze' },
  'charcoal-grill': { ar: 'مشاوي على الفحم', en: 'Charcoal Grill' },
  traditional: { ar: 'أطباق فلسطينية', en: 'Traditional Palestinian Dishes' },
  sides: { ar: 'أطباق جانبية', en: 'Side Dishes' },
  desserts: { ar: 'حلويات', en: 'Desserts' },
  'cold-beverages': { ar: 'مشروبات باردة', en: 'Cold Beverages' },
  'hot-beverages': { ar: 'مشروبات ساخنة', en: 'Hot Beverages' },
} satisfies Record<MenuCategory, Localized>

type Seed = Pick<MenuItem, 'id' | 'nameAr' | 'nameEn' | 'descriptionAr' | 'descriptionEn' | 'priceAED'> & {
  ingredients?: MenuItem['ingredients']
  reference?: string
  vegetarian?: boolean
  signature?: boolean
  featured?: boolean
  image?: string | null
  variants?: readonly MenuVariant[]
}

function category(id: MenuCategory, seeds: readonly Seed[]): MenuItem[] {
  return seeds.map(({ reference, vegetarian, signature, featured, image, variants, ...item }) => ({
    ...item,
    slug: item.id,
    category: id,
    image: image === undefined ? item.id : image,
    ingredients: item.ingredients ?? { ar: [], en: [] },
    dietaryTags: vegetarian ? ['vegetarian'] : [],
    isSignature: Boolean(signature),
    isFeatured: Boolean(featured),
    available: true,
    variants: variants ?? [],
    source: { url: menuSource, name: reference ?? item.nameEn },
  }))
}

function waterSizes(small: number, large: number): MenuVariant[] {
  return [
    { id: 'small', name: { ar: 'صغيرة', en: 'Small' }, priceAED: small },
    { id: 'large', name: { ar: 'كبيرة', en: 'Large' }, priceAED: large },
  ]
}

// Provisional AED prices for the UAE menu, pending marketing approval.
export const menuCatalog = [
  ...category('cold-mezze', [
    {
      id: 'hummus', nameAr: 'حمّص', nameEn: 'Hummus', priceAED: 28, vegetarian: true, signature: true, featured: true,
      descriptionAr: 'حمّص ناعم بالطحينة، تتوازن نكهته مع الليمون ولمسة من الثوم.',
      descriptionEn: 'A silky chickpea and tahini dip brightened with lemon and a little garlic.',
      ingredients: { ar: ['حمّص', 'طحينة', 'ليمون', 'ثوم'], en: ['Chickpeas', 'Tahini', 'Lemon', 'Garlic'] },
    },
    {
      id: 'moutabal', nameAr: 'متبّل الباذنجان', nameEn: 'Smoky Moutabal', reference: 'Moutabal', priceAED: 32, vegetarian: true,
      descriptionAr: 'باذنجان مشوي ممزوج بالطحينة والليمون والثوم، مع حبّات الرمان.',
      descriptionEn: 'Smoky grilled aubergine folded into tangy tahini and scattered with pomegranate seeds.',
      ingredients: { ar: ['باذنجان', 'طحينة', 'ليمون', 'ثوم', 'رمان'], en: ['Aubergine', 'Tahini', 'Lemon', 'Garlic', 'Pomegranate'] },
    },
    {
      id: 'labneh', nameAr: 'لبنة بالزعتر', nameEn: 'Labneh with Thyme', reference: 'Labneh', priceAED: 28, vegetarian: true,
      descriptionAr: 'لبنة كريمية من اللبن المصفّى مع الزعتر المجفّف، والثوم اختياري.',
      descriptionEn: 'Thick, tangy strained yoghurt with dried thyme. Garlic is optional.',
      ingredients: { ar: ['لبن مصفّى', 'زعتر مجفّف', 'ثوم اختياري'], en: ['Strained yoghurt', 'Dried thyme', 'Optional garlic'] },
    },
    {
      id: 'fattoush', nameAr: 'فتّوش', nameEn: 'Fattoush', reference: 'Fattush', priceAED: 36, vegetarian: true,
      descriptionAr: 'سلطة أوراق خضراء وطماطم مع خبز فلسطيني محمّص، ودبس الرمان والسماق والأعشاب.',
      descriptionEn: 'Leafy salad with tomatoes and shards of toasted Palestinian bread, tossed with sumac, herbs and pomegranate molasses.',
      ingredients: { ar: ['أوراق سلطة', 'طماطم', 'خبز محمّص', 'سماق', 'نعناع', 'زعتر', 'دبس رمان'], en: ['Mixed leaves', 'Tomatoes', 'Toasted bread', 'Sumac', 'Mint', 'Thyme', 'Pomegranate molasses'] },
    },
    {
      id: 'gaza-salad', nameAr: 'سلطة غزّية', nameEn: 'Gaza Tomato Salad', reference: 'Gaza salad', priceAED: 34, vegetarian: true,
      descriptionAr: 'طماطم مهروسة مع الشبت والفلفل الحار والثوم، ممزوجة بالطحينة والليمون وزيت الزيتون.',
      descriptionEn: 'Crushed tomatoes with dill and a chilli kick, dressed with lemon, tahini and olive oil.',
      ingredients: { ar: ['طماطم', 'شبت', 'فلفل حار', 'ثوم', 'طحينة', 'ليمون', 'زيت زيتون'], en: ['Tomatoes', 'Dill', 'Chilli', 'Garlic', 'Tahini', 'Lemon', 'Olive oil'] },
    },
    {
      id: 'maramia-salad', nameAr: 'سلطة مرامية', nameEn: 'Maramia Salad', priceAED: 38, vegetarian: true,
      descriptionAr: 'أوراق خضراء وطماطم وبصل أخضر مع البقدونس والنعناع والزعتر والميرمية، بتتبيلة الليمون وزيت الزيتون.',
      descriptionEn: 'Mixed leaves, tomato and spring onion with parsley, mint, thyme and sage in a lemon and olive oil dressing.',
      ingredients: { ar: ['أوراق سلطة', 'طماطم', 'بقدونس', 'بصل أخضر', 'نعناع', 'ليمون', 'زيت زيتون', 'زعتر', 'ميرمية'], en: ['Mixed leaves', 'Tomatoes', 'Parsley', 'Spring onion', 'Mint', 'Lemon', 'Olive oil', 'Thyme', 'Sage'] },
    },
  ]),
  ...category('hot-mezze', [
    {
      id: 'lentil-soup', nameAr: 'شوربة العدس', nameEn: 'Yellow Lentil Soup', reference: 'Lentil soup', priceAED: 28, vegetarian: true,
      descriptionAr: 'شوربة عدس أصفر دافئة بالكمّون وزيت الزيتون الفلسطيني، تُقدّم مع الخبز.',
      descriptionEn: 'Yellow lentils simmered with cumin and finished with Palestinian olive oil, served with bread.',
      ingredients: { ar: ['عدس أصفر', 'كمّون', 'زيت زيتون فلسطيني', 'خبز'], en: ['Yellow lentils', 'Cumin', 'Palestinian olive oil', 'Bread'] },
    },
    {
      id: 'falafel', nameAr: 'فلافل', nameEn: 'Falafel', priceAED: 29, vegetarian: true, signature: true, featured: true,
      descriptionAr: 'أقراص حمّص مقرمشة بالبقدونس والبصل والثوم والفلفل الحار، متبّلة بأعشاب فلسطينية وتُقدّم ساخنة.',
      descriptionEn: 'Crisp chickpea fritters seasoned with Palestinian herbs, parsley and chilli, served hot.',
      ingredients: { ar: ['حمّص', 'بقدونس', 'بصل', 'فلفل حار', 'ثوم', 'أعشاب فلسطينية'], en: ['Chickpeas', 'Parsley', 'Onion', 'Chilli', 'Garlic', 'Palestinian herbs'] },
    },
    {
      id: 'fried-kibbeh', nameAr: 'كبة مقلية', nameEn: 'Fried Kibbeh', reference: 'Kibbeh maklieh', priceAED: 38,
      descriptionAr: 'كبة من لحم الضأن والبرغل بحشوة لحم ضأن متبّل وبصل، مقلية حتى تصبح مقرمشة.',
      descriptionEn: 'Crisp bulgur and lamb shells around a filling of seasoned minced lamb and onion.',
      ingredients: { ar: ['لحم ضأن', 'برغل', 'بصل'], en: ['Lamb', 'Bulgur', 'Onion'] },
    },
    {
      id: 'vegetable-sambusek', nameAr: 'سمبوسك بالخضار', nameEn: 'Vegetable Sambusek', reference: 'Sambusek', priceAED: 29, vegetarian: true,
      descriptionAr: 'قطع سمبوسك بعجينة هشة وحشوة خضار.',
      descriptionEn: 'Flaky pastry pockets with a vegetable filling.',
      ingredients: { ar: ['عجينة', 'خضار'], en: ['Pastry', 'Vegetables'] },
    },
    {
      id: 'lamb-sujuk', nameAr: 'سجق ضأن', nameEn: 'Lamb Sujuk', reference: 'Sujuk', priceAED: 39,
      descriptionAr: 'سجق ضأن على الطريقة الفلسطينية مع الطماطم والثوم، يُقدّم ساخنًا مع عصير الليمون.',
      descriptionEn: 'Palestinian-style lamb sausages served hot with tomato, garlic and a squeeze of lemon.',
      ingredients: { ar: ['لحم ضأن', 'طماطم', 'ثوم', 'ليمون'], en: ['Lamb', 'Tomatoes', 'Garlic', 'Lemon'] },
    },
    {
      id: 'foul-medammas', nameAr: 'فول مدمّس', nameEn: 'Foul Medammas', priceAED: 29, vegetarian: true,
      descriptionAr: 'فول مهروس على الطريقة الفلسطينية مع الطحينة والثوم والفلفل الأخضر الحار ولمسة ليمون.',
      descriptionEn: 'Palestinian-style mashed fava beans with tahini, green chilli, garlic and lemon.',
      ingredients: { ar: ['فول', 'طحينة', 'فلفل أخضر حار', 'ثوم', 'ليمون'], en: ['Fava beans', 'Tahini', 'Green chilli', 'Garlic', 'Lemon'] },
    },
    {
      id: 'batata-harra', nameAr: 'بطاطا حارّة', nameEn: 'Batata Harra', priceAED: 29, vegetarian: true,
      descriptionAr: 'مكعّبات بطاطا مشوّحة مع الفلفل الحلو والحار والثوم والكزبرة.',
      descriptionEn: 'Golden potato cubes sautéed with sweet peppers, chilli, coriander and garlic.',
      ingredients: { ar: ['بطاطا', 'فلفل حلو', 'فلفل حار', 'كزبرة', 'ثوم'], en: ['Potatoes', 'Sweet peppers', 'Chilli', 'Coriander', 'Garlic'] },
    },
    {
      id: 'grilled-halloumi', nameAr: 'حلّوم مشوي', nameEn: 'Grilled Halloumi', reference: 'Halloumi', priceAED: 38, vegetarian: true,
      descriptionAr: 'شرائح جبنة حلّوم مشوية حتى تكتسب لونًا ذهبيًا.',
      descriptionEn: 'Slices of halloumi grilled until golden at the edges.',
      ingredients: { ar: ['جبنة حلّوم'], en: ['Halloumi cheese'] },
    },
    {
      id: 'lamb-arayes', nameAr: 'عرايس باللحم', nameEn: 'Lamb Arayes', reference: 'Arayes', priceAED: 38,
      descriptionAr: 'خبز فلسطيني محشو بلحم ضأن مفروم متبّل بالبقدونس والبصل والثوم والفلفل الحار، ومشوي على الفحم.',
      descriptionEn: 'Palestinian flatbread stuffed with seasoned minced lamb and charred over charcoal.',
      ingredients: { ar: ['خبز فلسطيني', 'لحم ضأن', 'بقدونس', 'بصل', 'ثوم', 'فلفل حار'], en: ['Palestinian bread', 'Lamb', 'Parsley', 'Onion', 'Garlic', 'Chilli'] },
    },
    {
      id: 'grilled-wings', nameAr: 'أجنحة دجاج مشوية', nameEn: 'Grilled Chicken Wings', reference: 'Jawaneh meshwui', priceAED: 36,
      descriptionAr: 'أجنحة دجاج مشوية تُقدّم ساخنة.',
      descriptionEn: 'Chicken wings, grilled and served hot.',
      ingredients: { ar: ['أجنحة دجاج'], en: ['Chicken wings'] },
    },
  ]),
  ...category('charcoal-grill', [
    {
      id: 'charcoal-chicken', nameAr: 'دجاج على الفحم', nameEn: 'Charcoal-Grilled Chicken', reference: 'Grilled chicken (charcoal grilled)', priceAED: 65,
      descriptionAr: 'نصف دجاجة أو دجاجة كاملة، بتتبيلة البقدونس والطماطم والثوم والفلفل الحار والبابريكا المدخّنة.',
      descriptionEn: 'Charcoal chicken marinated with parsley, tomato, garlic and smoked paprika. Choose a half or whole chicken.',
      ingredients: { ar: ['دجاج', 'بقدونس', 'بصل', 'طماطم', 'ثوم', 'فلفل حار', 'بابريكا مدخّنة'], en: ['Chicken', 'Parsley', 'Onion', 'Tomatoes', 'Garlic', 'Chilli', 'Smoked paprika'] },
      variants: [
        { id: 'half', name: { ar: 'نصف دجاجة', en: 'Half Chicken' }, priceAED: 65 },
        { id: 'whole', name: { ar: 'دجاجة كاملة', en: 'Whole Chicken' }, priceAED: 108 },
      ],
    },
    {
      id: 'shish-tawouk', nameAr: 'شيش طاووق', nameEn: 'Shish Tawouk', priceAED: 68,
      descriptionAr: 'أسياخ صدر دجاج متبّلة بالزعفران والثوم والبابريكا المدخّنة والفلفل الأسود وزيت الزيتون.',
      descriptionEn: 'Grilled chicken breast skewers marinated in saffron, garlic, smoked paprika, black pepper and olive oil.',
      ingredients: { ar: ['صدر دجاج', 'زعفران', 'ثوم', 'بابريكا مدخّنة', 'فلفل أسود', 'زيت زيتون'], en: ['Chicken breast', 'Saffron', 'Garlic', 'Smoked paprika', 'Black pepper', 'Olive oil'] },
    },
    {
      id: 'grilled-lamb-fillet', nameAr: 'لحم ضأن مشوي', nameEn: 'Grilled Lamb Fillet', reference: 'Lahem meshweh', priceAED: 92,
      descriptionAr: 'قطع فيليه ضأن مشوية بتتبيلة الثوم والفلفل الحار والأسود وزيت الزيتون.',
      descriptionEn: 'Grilled lamb fillet seasoned with garlic, chilli, black pepper and olive oil.',
      ingredients: { ar: ['فيليه ضأن', 'ثوم', 'فلفل حار', 'فلفل أسود', 'زيت زيتون'], en: ['Lamb fillet', 'Garlic', 'Chilli', 'Black pepper', 'Olive oil'] },
    },
    {
      id: 'palestinian-kebab', nameAr: 'كباب فلسطيني', nameEn: 'Palestinian Lamb Kebab', reference: 'Kebab falastineh', priceAED: 79,
      descriptionAr: 'أسياخ لحم ضأن مفروم متبّلة بالبقدونس والبصل والثوم والفلفل.',
      descriptionEn: 'Minced lamb skewers seasoned with parsley, onion, garlic, chilli and black pepper.',
      ingredients: { ar: ['لحم ضأن مفروم', 'بقدونس', 'بصل', 'ثوم', 'فلفل حار', 'فلفل أسود'], en: ['Minced lamb', 'Parsley', 'Onion', 'Garlic', 'Chilli', 'Black pepper'] },
    },
    {
      id: 'mixed-grill', nameAr: 'مشاوي مشكّلة', nameEn: 'Mixed Grill', reference: 'Mix grill', priceAED: 109, signature: true, featured: true,
      descriptionAr: 'تشكيلة على الفحم من فيليه الضأن وصدر الدجاج والأجنحة وسجق الضأن وريشة ضأن.',
      descriptionEn: 'A charcoal platter of lamb fillet, chicken breast and wings, lamb sausage and a lamb cutlet.',
      ingredients: { ar: ['فيليه ضأن', 'صدر دجاج', 'أجنحة دجاج', 'سجق ضأن', 'ريشة ضأن'], en: ['Lamb fillet', 'Chicken breast', 'Chicken wings', 'Lamb sausage', 'Lamb cutlet'] },
    },
    {
      id: 'lamb-cutlets', nameAr: 'ريش ضأن مشوية', nameEn: 'Grilled Lamb Cutlets', reference: 'Kastaleta', priceAED: 102,
      descriptionAr: 'أربع ريش ضأن مشوية بتتبيلة زيت الزيتون والثوم والفلفل الحار والأسود.',
      descriptionEn: 'Four grilled lamb cutlets marinated with olive oil, garlic, chilli and black pepper.',
      ingredients: { ar: ['ريش ضأن', 'زيت زيتون', 'ثوم', 'فلفل حار', 'فلفل أسود'], en: ['Lamb cutlets', 'Olive oil', 'Garlic', 'Chilli', 'Black pepper'] },
    },
    {
      id: 'spiced-sea-bass', nameAr: 'سمكة حرّة بالقاروص', nameEn: 'Spiced Sea Bass', reference: 'Samaka harra (sea bass)', priceAED: 108,
      descriptionAr: 'قاروص مشوي بتتبيلة الليمون وزيت الزيتون والفلفل الحار والثوم والكمّون والأعشاب.',
      descriptionEn: 'Sea bass marinated with lemon, olive oil, fresh chilli, garlic, cumin, parsley and coriander.',
      ingredients: { ar: ['قاروص', 'فلفل حار', 'ثوم', 'بقدونس', 'كزبرة', 'كمّون', 'ليمون', 'زيت زيتون'], en: ['Sea bass', 'Chilli', 'Garlic', 'Parsley', 'Coriander', 'Cumin', 'Lemon', 'Olive oil'] },
    },
    {
      id: 'charcoal-prawns', nameAr: 'روبيان ملكي على الفحم', nameEn: 'Charcoal King Prawns', reference: 'King prawn', priceAED: 110,
      descriptionAr: 'روبيان ملكي مشوي على الفحم، مع الأرز وصلصة الطماطم المشوية بالفلفل الحار والثوم.',
      descriptionEn: 'Charcoal-cooked king prawns with rice and a grilled tomato, chilli and garlic sauce.',
      ingredients: { ar: ['روبيان ملكي', 'أرز', 'طماطم', 'فلفل حار', 'ثوم'], en: ['King prawns', 'Rice', 'Tomatoes', 'Chilli', 'Garlic'] },
    },
  ]),
  ...category('traditional', [
    {
      id: 'chicken-musakhan', nameAr: 'مسخّن الدجاج', nameEn: 'Chicken Musakhan', reference: 'Chicken mousakhan', priceAED: 72, signature: true, featured: true,
      descriptionAr: 'صدر دجاج مشوي مع بصل مكرمل وسماق بين رقائق خبز رفيعة، يُقدّم مع سلطة طازجة وصلصة اللبن.',
      descriptionEn: 'Grilled chicken breast and caramelised sumac onions tucked between thin flatbreads, with fresh salad and a yoghurt dip.',
      ingredients: { ar: ['صدر دجاج', 'بصل', 'سماق', 'خبز رفيع', 'سلطة طازجة', 'صلصة لبن'], en: ['Chicken breast', 'Onion', 'Sumac', 'Thin flatbread', 'Fresh salad', 'Yoghurt dip'] },
    },
    {
      id: 'halloumi-thyme', nameAr: 'حلّوم وزعتر', nameEn: 'Halloumi and Thyme', reference: 'Halloumi & thyme', priceAED: 57, vegetarian: true,
      descriptionAr: 'جبنة حلّوم ومعجون زعتر فلسطيني بين رقائق خبز رفيعة، مع سلطة طازجة.',
      descriptionEn: 'Halloumi and Palestinian thyme paste layered in thin flatbread and served with a fresh salad.',
      ingredients: { ar: ['جبنة حلّوم', 'معجون زعتر فلسطيني', 'خبز رفيع', 'سلطة طازجة'], en: ['Halloumi cheese', 'Palestinian thyme paste', 'Thin flatbread', 'Fresh salad'] },
    },
    {
      id: 'palestinian-moussaka', nameAr: 'مسقّعة فلسطينية', nameEn: 'Palestinian Moussaka', priceAED: 59, vegetarian: true,
      descriptionAr: 'باذنجان مقلي يُخبز مع الطماطم والحمّص والبصل والثوم والفلفل الحار والبابريكا، ويُقدّم مع الأرز.',
      descriptionEn: 'Fried aubergine baked with tomato, chickpeas, onion, garlic, chilli and paprika, served with rice.',
      ingredients: { ar: ['باذنجان', 'طماطم', 'حمّص', 'بصل', 'ثوم', 'فلفل حار', 'بابريكا', 'أرز'], en: ['Aubergine', 'Tomatoes', 'Chickpeas', 'Onion', 'Garlic', 'Chilli', 'Paprika', 'Rice'] },
    },
    {
      id: 'palestinian-maftoul', nameAr: 'مفتول فلسطيني', nameEn: 'Palestinian Maftoul', reference: 'Maftoul (Palestinian cous cous)', priceAED: 58, vegetarian: true, signature: true, featured: true,
      descriptionAr: 'مفتول فلسطيني يُطهى مع اليقطين والطماطم والحمّص والثوم والفلفل الحار.',
      descriptionEn: 'Palestinian couscous cooked with pumpkin, tomatoes, chickpeas, garlic and fresh chilli.',
      ingredients: { ar: ['مفتول', 'يقطين', 'طماطم', 'حمّص', 'ثوم', 'فلفل حار'], en: ['Maftoul couscous', 'Pumpkin', 'Tomatoes', 'Chickpeas', 'Garlic', 'Chilli'] },
    },
    {
      id: 'chicken-maftoul', nameAr: 'مفتول بالدجاج', nameEn: 'Chicken Maftoul', priceAED: 76,
      descriptionAr: 'مفتول فلسطيني مع الدجاج واليقطين والحمّص والطماطم، بنكهة الثوم والفلفل الحار.',
      descriptionEn: 'Palestinian couscous and chicken with pumpkin, chickpeas, tomato, garlic and fresh chilli.',
      ingredients: { ar: ['مفتول', 'دجاج', 'يقطين', 'حمّص', 'طماطم', 'ثوم', 'فلفل حار'], en: ['Maftoul couscous', 'Chicken', 'Pumpkin', 'Chickpeas', 'Tomatoes', 'Garlic', 'Chilli'] },
    },
  ]),
  ...category('sides', [
    {
      id: 'kabis', nameAr: 'كبيس مشكّل', nameEn: 'Kabis Pickles', reference: 'Kabis', priceAED: 15, vegetarian: true,
      descriptionAr: 'تشكيلة خضار مخلّلة تُقدّم إلى جانب الأطباق.',
      descriptionEn: 'A side of assorted pickled vegetables.',
      ingredients: { ar: ['خضار مخلّلة'], en: ['Pickled vegetables'] },
    },
    {
      id: 'qudsiyeh', nameAr: 'قدسية بالطحينة', nameEn: 'Qudsiyeh Tahini Sauce', reference: 'Qudsiyeh', priceAED: 9, vegetarian: true,
      descriptionAr: 'صلصة طحينة مع الثوم والبقدونس والليمون الطازج.',
      descriptionEn: 'Tahini sauce sharpened with lemon and garlic and flecked with parsley.',
      ingredients: { ar: ['طحينة', 'ثوم', 'بقدونس', 'ليمون'], en: ['Tahini', 'Garlic', 'Parsley', 'Lemon'] },
    },
    {
      id: 'garlic-sauce', nameAr: 'صلصة الثوم', nameEn: 'Garlic Sauce', priceAED: 8,
      descriptionAr: 'صلصة ثوم تُقدّم إلى جانب الأطباق.',
      descriptionEn: 'A side of garlic sauce for dipping.',
      ingredients: { ar: ['ثوم'], en: ['Garlic'] },
    },
    {
      id: 'potato-chips', nameAr: 'بطاطا مقلية', nameEn: 'French Fries', reference: 'Chips', priceAED: 22, vegetarian: true,
      descriptionAr: 'أصابع بطاطا مقلية تُقدّم ساخنة.',
      descriptionEn: 'Golden fried potatoes served hot.',
      ingredients: { ar: ['بطاطا'], en: ['Potatoes'] },
    },
    {
      id: 'kidra-rice', nameAr: 'أرز القدرة الفلسطيني', nameEn: 'Palestinian Kidra Rice', reference: 'Palestinian rice (kidra)', priceAED: 24, vegetarian: true,
      descriptionAr: 'أرز فلسطيني مطهو بالحمّص والطماطم والبصل والثوم والفلفل الحار.',
      descriptionEn: 'Palestinian-style rice cooked with chickpeas, tomato, onion, garlic and chilli.',
      ingredients: { ar: ['أرز', 'حمّص', 'طماطم', 'بصل', 'ثوم', 'فلفل حار'], en: ['Rice', 'Chickpeas', 'Tomatoes', 'Onion', 'Garlic', 'Chilli'] },
    },
  ]),
  ...category('desserts', [
    {
      id: 'basboussa', nameAr: 'بسبوسة', nameEn: 'Coconut Basboussa', reference: 'Basboussa', priceAED: 27,
      descriptionAr: 'بسبوسة فلسطينية بجوز الهند والعسل والفستق المجروش.',
      descriptionEn: 'Palestinian coconut cake sweetened with honey and topped with crushed pistachios.',
      ingredients: { ar: ['جوز هند', 'عسل', 'فستق'], en: ['Coconut', 'Honey', 'Pistachios'] },
    },
    {
      id: 'baklava', nameAr: 'بقلاوة مشكّلة', nameEn: 'Assorted Baklava', reference: 'Baklava', priceAED: 31,
      descriptionAr: 'تشكيلة من البقلاوة بعجينة الفيلو الهشّة والعسل.',
      descriptionEn: 'A selection of crisp, honey-soaked filo pastries.',
      ingredients: { ar: ['عجينة فيلو', 'عسل'], en: ['Filo pastry', 'Honey'] },
    },
    {
      id: 'nabulsi-knafeh', nameAr: 'كنافة نابلسية', nameEn: 'Nabulsi Knafeh', reference: 'Knefeh naboulsia', priceAED: 39, signature: true, featured: true,
      descriptionAr: 'كنافة فلسطينية بالجبن، تُقدّم دافئة مع القطر.',
      descriptionEn: 'Palestinian cheese knafeh served warm with syrup.',
      ingredients: { ar: ['جبن', 'قطر'], en: ['Cheese', 'Syrup'] },
    },
  ]),
  ...category('cold-beverages', [
    {
      id: 'lemon-mint', nameAr: 'ليمون بالنعناع', nameEn: 'Fresh Lemon and Mint', reference: 'Fresh lemon & mind juice', priceAED: 24,
      descriptionAr: 'عصير ليمون طازج مع النعناع، يُقدّم باردًا.',
      descriptionEn: 'Fresh lemon juice with mint, served chilled.',
      ingredients: { ar: ['ليمون', 'نعناع'], en: ['Lemon', 'Mint'] },
    },
    {
      id: 'fentimans-cola', nameAr: 'كولا فينتيمانز', nameEn: 'Fentimans Cola', priceAED: 23,
      descriptionAr: 'مشروب كولا غازي من فينتيمانز.',
      descriptionEn: 'A sparkling cola from Fentimans, served chilled.',
    },
    {
      id: 'rose-lemonade', nameAr: 'ليمونادة بالورد من فينتيمانز', nameEn: 'Fentimans Rose Lemonade', priceAED: 24,
      descriptionAr: 'ليمونادة غازية بنكهة الورد من فينتيمانز.',
      descriptionEn: 'Fentimans sparkling lemonade with a rose flavour.',
    },
    {
      id: 'ginger-beer', nameAr: 'مشروب زنجبيل غازي من فينتيمانز', nameEn: 'Fentimans Ginger Beer (Soft Drink)', reference: 'Fentimans ginger beer', priceAED: 23,
      descriptionAr: 'مشروب غازي بنكهة الزنجبيل من فينتيمانز.',
      descriptionEn: 'A sparkling ginger soft drink from Fentimans.',
    },
    {
      id: 'light-lemonade', nameAr: 'ليمونادة لايت من فيفر تري', nameEn: 'Fever-Tree Light Lemonade', reference: 'Fever-tree lemonade (light)', priceAED: 19,
      descriptionAr: 'ليمونادة غازية لايت من فيفر تري.',
      descriptionEn: 'A light sparkling lemonade from Fever-Tree.',
    },
    {
      id: 'light-tonic', nameAr: 'مياه تونيك لايت من فيفر تري', nameEn: 'Fever-Tree Light Tonic Water', reference: 'Fever-tree tonic water (light)', priceAED: 19,
      descriptionAr: 'مياه تونيك غازية لايت من فيفر تري.',
      descriptionEn: 'Fever-Tree light tonic water, served chilled.',
    },
    {
      id: 'light-soda', nameAr: 'مياه صودا لايت من فيفر تري', nameEn: 'Fever-Tree Light Soda Water', reference: 'Fever-tree soda water (light)', priceAED: 18,
      descriptionAr: 'مياه صودا من فيفر تري تُقدّم باردة.',
      descriptionEn: 'Fever-Tree light soda water, served cold.',
    },
    {
      id: 'still-water', nameAr: 'مياه معدنية غير غازية', nameEn: 'Still Mineral Water', priceAED: 10,
      descriptionAr: 'مياه معدنية غير غازية بحجم صغير أو كبير.',
      descriptionEn: 'Still mineral water in a small or large size.',
      ingredients: { ar: ['مياه معدنية'], en: ['Mineral water'] },
      variants: waterSizes(10, 19),
    },
    {
      id: 'sparkling-water', nameAr: 'مياه معدنية غازية', nameEn: 'Sparkling Mineral Water', priceAED: 13,
      descriptionAr: 'مياه معدنية غازية بحجم صغير أو كبير.',
      descriptionEn: 'Sparkling mineral water in a small or large size.',
      ingredients: { ar: ['مياه معدنية غازية'], en: ['Sparkling mineral water'] },
      variants: waterSizes(13, 23),
    },
    {
      id: 'taybeh-non-alcoholic', nameAr: 'مشروب طيبة غير الكحولي', nameEn: 'Taybeh Non-Alcoholic', reference: 'Taybeh Non Alcohol, 330ml', priceAED: 26, image: null,
      descriptionAr: 'مشروب طيبة غير الكحولي بحجم ٣٣٠ مل.',
      descriptionEn: 'Taybeh’s non-alcoholic drink, served in a 330 ml size.',
    },
  ]),
  ...category('hot-beverages', [
    {
      id: 'palestinian-coffee', nameAr: 'قهوة فلسطينية', nameEn: 'Palestinian Coffee', priceAED: 19,
      descriptionAr: 'فنجان قهوة على الطريقة الفلسطينية.',
      descriptionEn: 'A cup of Palestinian-style coffee.',
      ingredients: { ar: ['قهوة'], en: ['Coffee'] },
    },
    {
      id: 'herbal-tea', nameAr: 'شاي أعشاب', nameEn: 'Herbal Tea', priceAED: 22,
      descriptionAr: 'اختر شاي النعناع أو الميرمية.',
      descriptionEn: 'Choose a warm infusion of mint or sage.',
      ingredients: { ar: ['نعناع (خيار)', 'ميرمية (خيار)'], en: ['Mint (option)', 'Sage (option)'] },
      variants: [
        { id: 'mint', name: { ar: 'نعناع', en: 'Mint' }, priceAED: 22 },
        { id: 'sage', name: { ar: 'ميرمية', en: 'Sage' }, priceAED: 22 },
      ],
    },
  ]),
] satisfies MenuItem[]
