import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

const dict: Dict = {
  "nav.shop": { en: "Shop", ar: "المتجر" },
  "nav.custom": { en: "Custom", ar: "تصميم" },
  "nav.lookbook": { en: "Lookbook", ar: "المجموعة" },
  "nav.account": { en: "Account", ar: "حسابي" },
  "nav.cart": { en: "Cart", ar: "السلة" },
  "nav.admin": { en: "Admin", ar: "الإدارة" },
  "hero.title.1": { en: "The Archetype", ar: "نموذج" },
  "hero.title.2": { en: "of Expression.", ar: "التعبير." },
  "hero.subtitle": {
    en: "Premium essentials meet personal curation. Ready-made collections and precision custom design for the modern silhouette.",
    ar: "أساسيات فاخرة تلتقي بالتنسيق الشخصي. مجموعات جاهزة وتصميم مخصص دقيق للصورة العصرية.",
  },
  "hero.cta.shop": { en: "Shop Collection", ar: "تسوق المجموعة" },
  "hero.cta.design": { en: "Design Your Own", ar: "صمم قطعتك" },
  "featured.title": { en: "Featured Selects", ar: "مختارات مميزة" },
  "featured.viewAll": { en: "View All", ar: "عرض الكل" },
  "custom.badge": { en: "Studio Access", ar: "دخول الاستوديو" },
  "custom.title.1": { en: "Your perspective,", ar: "رؤيتك الخاصة،" },
  "custom.title.2": { en: "our craftsmanship.", ar: "بحرفيتنا." },
  "custom.desc": {
    en: "Access the AimoWear design suite. Select your base silhouette, upload your vision, and choose premium print positions.",
    ar: "استخدم مجموعة تصميم AimoWear. اختر القطعة، ارفع فكرتك، وحدد مواقع الطباعة الفاخرة.",
  },
  "custom.step.1": { en: "Select Canvas", ar: "اختر القطعة" },
  "custom.step.2": { en: "Upload Artwork", ar: "ارفع التصميم" },
  "custom.step.3": { en: "Precision Placement", ar: "تحديد الموقع" },
  "custom.cta": { en: "Enter Custom Studio", ar: "ادخل الاستوديو" },
  "story.eyebrow": { en: "The Aimo Ethos", ar: "فلسفة أيمو" },
  "story.body": {
    en: "We believe the garment is a vessel for identity. Whether through our curated silhouettes or your custom designs, AimoWear provides the language for your aesthetic dialogue.",
    ar: "نؤمن بأن الملابس وعاء للهوية. سواء من خلال قطعنا المختارة أو تصاميمك الخاصة، AimoWear هي لغة حوارك الجمالي.",
  },
  "newsletter.title": { en: "Join the Dialogue", ar: "انضم للحوار" },
  "newsletter.sub": { en: "Access to drops, studio updates, and exclusive previews.", ar: "إشعارات الإصدارات وأخبار الاستوديو والمعاينات الحصرية." },
  "newsletter.placeholder": { en: "ENTER EMAIL", ar: "البريد الإلكتروني" },
  "newsletter.cta": { en: "Subscribe", ar: "اشترك" },
  "footer.nav": { en: "Navigation", ar: "روابط" },
  "footer.social": { en: "Social", ar: "تواصل" },
  "footer.rights": { en: "© 2026 AIMOWEAR STUDIO. ALL RIGHTS RESERVED.", ar: "© ٢٠٢٦ استوديو AIMOWEAR. جميع الحقوق محفوظة." },
  "shop.title": { en: "The Collection", ar: "المجموعة" },
  "shop.filter.all": { en: "All", ar: "الكل" },
  "shop.filter.tees": { en: "Tees", ar: "تيشيرت" },
  "shop.filter.hoodies": { en: "Hoodies", ar: "هوديز" },
  "shop.filter.outer": { en: "Outerwear", ar: "معاطف" },
  "shop.filter.pants": { en: "Pants", ar: "بناطيل" },
  "shop.filter.acc": { en: "Accessories", ar: "إكسسوارات" },
  "product.size": { en: "Size", ar: "المقاس" },
  "product.qty": { en: "Quantity", ar: "الكمية" },
  "product.addToCart": { en: "Add to Cart", ar: "أضف للسلة" },
  "product.details": { en: "Details", ar: "التفاصيل" },
  "product.reviews": { en: "Reviews", ar: "التقييمات" },
  "product.description": { en: "Description", ar: "الوصف" },
  "cart.title": { en: "Your Bag", ar: "سلتك" },
  "cart.empty": { en: "Your bag is empty.", ar: "السلة فارغة." },
  "cart.subtotal": { en: "Subtotal", ar: "المجموع الفرعي" },
  "cart.shipping": { en: "Shipping", ar: "الشحن" },
  "cart.total": { en: "Total", ar: "الإجمالي" },
  "cart.checkout": { en: "Checkout", ar: "الدفع" },
  "cart.remove": { en: "Remove", ar: "حذف" },
  "cart.continue": { en: "Continue Shopping", ar: "متابعة التسوق" },
  "checkout.title": { en: "Checkout", ar: "إتمام الطلب" },
  "checkout.contact": { en: "Contact", ar: "التواصل" },
  "checkout.shipping": { en: "Shipping Address", ar: "عنوان الشحن" },
  "checkout.payment": { en: "Payment", ar: "الدفع" },
  "checkout.place": { en: "Place Order", ar: "تأكيد الطلب" },
  "checkout.name": { en: "Full name", ar: "الاسم الكامل" },
  "checkout.email": { en: "Email", ar: "البريد" },
  "checkout.address": { en: "Street address", ar: "العنوان" },
  "checkout.city": { en: "City", ar: "المدينة" },
  "checkout.country": { en: "Country", ar: "الدولة" },
  "checkout.zip": { en: "Postal code", ar: "الرمز البريدي" },
  "checkout.card": { en: "Card number", ar: "رقم البطاقة" },
  "checkout.phone": { en: "Phone", ar: "الهاتف" },
  "checkout.cod": { en: "Cash on Delivery", ar: "الدفع عند الاستلام" },
  "checkout.bank": { en: "Bank Transfer — Arab Islamic Bank", ar: "تحويل بنكي — البنك العربي الإسلامي" },
  "account.title": { en: "Account", ar: "حسابي" },
  "account.orders": { en: "Orders", ar: "طلباتي" },
  "account.designs": { en: "Custom Designs", ar: "تصاميمي" },
  "account.profile": { en: "Profile", ar: "الملف الشخصي" },
  "account.signout": { en: "Sign out", ar: "خروج" },
  "order.title": { en: "Order", ar: "الطلب" },
  "order.status": { en: "Status", ar: "الحالة" },
  "order.placed": { en: "Placed", ar: "تم الطلب" },
  "order.production": { en: "In Production", ar: "قيد التصنيع" },
  "order.shipped": { en: "Shipped", ar: "تم الشحن" },
  "order.delivered": { en: "Delivered", ar: "تم التوصيل" },
  "order.requestReturn": { en: "Request Return", ar: "طلب إرجاع" },
  "order.returnRequested": { en: "Return Requested", ar: "تم طلب الإرجاع" },
  "order.returned": { en: "Returned", ar: "تم الإرجاع" },
  "product.writeReview": { en: "Write a Review", ar: "اكتب تقييماً" },
  "product.submitReview": { en: "Submit Review", ar: "إرسال التقييم" },
  "admin.title": { en: "Admin Dashboard", ar: "لوحة الإدارة" },
  "admin.products": { en: "Products", ar: "المنتجات" },
  "admin.orders": { en: "Orders", ar: "الطلبات" },
  "admin.customers": { en: "Customers", ar: "العملاء" },
  "admin.inventory": { en: "Inventory", ar: "المخزون" },
  "admin.returns": { en: "Returns", ar: "المرتجعات" },
  "admin.revenue": { en: "Revenue", ar: "الإيرادات" },
  "custom.upload": { en: "Upload Image", ar: "ارفع صورة" },
  "custom.text": { en: "Add Text", ar: "أضف نص" },
  "custom.position": { en: "Print Position", ar: "موقع الطباعة" },
  "custom.color": { en: "Base Color", ar: "اللون الأساسي" },
  "custom.front": { en: "Front", ar: "الأمام" },
  "custom.back": { en: "Back", ar: "الخلف" },
  "custom.sleeve": { en: "Sleeve", ar: "الكم" },
  "custom.preview": { en: "Preview", ar: "معاينة" },
  "common.from": { en: "From", ar: "من" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aimo.lang") as Lang | null;
      if (saved === "ar" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("aimo.lang", l); } catch {}
  };

  const t = (key: keyof typeof dict) => dict[key]?.[lang] ?? String(key);
  return <Ctx.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}
