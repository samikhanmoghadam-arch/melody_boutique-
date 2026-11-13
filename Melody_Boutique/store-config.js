/* تنظیمات اصلی فروشگاه Melody Boutique
   برای تغییر لینک‌ها، کدهای تخفیف و تخفیف سراسری همین فایل را ویرایش کن. */
window.STORE_CONFIG = {
  brandName: "Melody Boutique",
  currency: "تومان",
  telegramUsername: "samae_gh",
  telegramProfileUrl: "https://t.me/samae_gh",
  instagramUrl: "https://www.instagram.com/melody_boutique_n/",
  // تخفیف خودکار روی همه محصولات؛ برای خاموش کردن enabled را false کن.
  sale: {
    enabled: false,
    percent: 15,
    startsAt: "2026-11-10T00:00:00",
    endsAt: "2026-11-10T23:59:00",
    label: "FLASH SALE"
  },
  // کدها را اضافه، حذف یا ویرایش کن. تاریخ‌ها با ساعت محلی بازدیدکننده سنجیده می‌شوند.
  coupons: [
    { code: "MELODY2026", type: "percent", value: 25, active: true, minSubtotal: 0, startsAt: "", endsAt: "", appliesTo: "all", maxUses: 0 },
    { code: "FRIDAY2026", type: "percent", value: 10, active: true, minSubtotal: 0, startsAt: "", endsAt: "", appliesTo: "all", maxUses: 0 },
    { code: "WELCOME2026", type: "percent", value: 5, active: true, minSubtotal: 0, startsAt: "", endsAt: "", appliesTo: "all", maxUses: 0 }
  ]
  
};