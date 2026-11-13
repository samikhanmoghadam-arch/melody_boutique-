/* محصولات را اینجا اضافه کن (نمونه آماده‌ی کپی: فایل PRODUCT-EXAMPLE.js.txt).
   - images: اسم فایل عکس‌ها داخل پوشه images، مثلاً ["1.jpg", "2.jpg"]  (یک یا دو عکس)
   - category: tops | dresses | outerwear | bottoms | bags | accessories
   - featured: true بگذار تا در بخش «محصولات ویژه» هم نمایش داده شود
   - tags: کلمه‌های کلیدی برای جست‌وجو (مثلاً ["کیف", "مجلسی"])
   - sizes: [] برای اکسسوری و کیف
   هر id باید یکتا باشد. */
window.PRODUCTS = [
  {
    id: "mb-001", name: "بلوز روزمره", englishName: "THE EVERYDAY BLOUSE",
    category: "tops", price: 890000, images: [], badge: "NEW", isNew: true, featured: false, stock: 8,
    colors: ["شیری", "صورتی", "مشکی"], sizes: ["S", "M", "L", "XL"], tags: ["بلوز", "روزمره"],
    description: "یک انتخاب راحت و کاربردی برای استایل روزمره.",
    specs: { "جنس پارچه": "نخی", "فرم": "آزاد", "مناسب فصل": "چهارفصل" }
  },
  {
    id: "mb-002", name: "پیراهن یاسی", englishName: "LILAC MOMENT DRESS",
    category: "dresses", price: 1490000, images: [], badge: "BESTSELLER", isNew: false, featured: true, stock: 5,
    colors: ["یاسی", "سفید"], sizes: ["S", "M", "L"], tags: ["پیراهن", "مجلسی"],
    description: "پیراهنی لطیف برای لحظه‌های خاص و روزهای معمولی.",
    specs: { "جنس پارچه": "کرپ", "قد": "میدی", "آستین": "بلند" }
  },
  {
    id: "mb-003", name: "کت کوتاه", englishName: "THE MINI JACKET",
    category: "outerwear", price: 2190000, images: [], badge: "NEW", isNew: true, featured: false, stock: 4,
    colors: ["کرم", "قهوه‌ای"], sizes: ["S", "M", "L"], tags: ["کت", "مانتو"],
    description: "یک لایه شیک برای کامل کردن استایل.",
    specs: { "جنس پارچه": "فاستونی", "آستر": "دارد", "فرم": "نیمه آزاد" }
  },
  {
    id: "mb-004", name: "کیف دستی", englishName: "EVERYDAY MINI BAG",
    category: "bags", price: 1250000, images: [], badge: "JUST IN", isNew: true, featured: true, stock: 7,
    colors: ["مشکی", "کرم", "زرشکی"], sizes: [], tags: ["کیف", "اکسسوری"],
    description: "کیف جمع‌وجور و کاربردی برای همراهی هر روز.",
    specs: { "جنس بدنه": "چرم مصنوعی", "جنس آستر": "پارچه", "نوع بند": "قابل تنظیم", "بسته شدن": "زیپی" }
  },
  {
    id: "mb-005", name: "شلوار پارچه‌ای", englishName: "WIDE LEG TROUSERS",
    category: "bottoms", price: 1690000, images: [], badge: "", isNew: false, featured: false, stock: 6,
    colors: ["طوسی", "مشکی"], sizes: ["S", "M", "L", "XL"], tags: ["شلوار"],
    description: "شلوار خوش‌فرم با برش آزاد و راحت.",
    specs: { "جنس پارچه": "مازراتی", "مدل": "واید لگ", "فاق": "بلند" }
  },
  {
  id: "mb-007",
  name: "شلوار لنین",
  englishName: "LINEN DAYS",
  category: "bottoms",
  price: 1850000,
  images: ["1.jpg", "2.jpg"],
  badge: "NEW",
  isNew: true,
  featured: false,
  stock: 5,
  colors: ["کرم", "آبی"],
  sizes: ["M", "L", "XL"],
  tags: ["مانتو", "لینن", "بهاری"],
  description: "مانتوی سبک و راحت برای روزهای بهاری.",
  specs: {
    "جنس پارچه": "لینن",
    "قد": "بلند",
    "مدل": "آزاد"
  }

},
  {
    id: "mb-006", name: "دامن چین‌دار", englishName: "SOFT PLEATED SKIRT",
    category: "bottoms", price: 1190000, images: [], badge: "LIMITED", isNew: false, featured: false, stock: 3,
    colors: ["صورتی", "سفید", "مشکی"], sizes: ["S", "M", "L"], tags: ["دامن"],
    description: "دامنی سبک با حرکت و فرم لطیف.",
    specs: { "جنس پارچه": "حریر با آستر", "قد": "بلند", "کمر": "کش‌دار" }
  }
];
