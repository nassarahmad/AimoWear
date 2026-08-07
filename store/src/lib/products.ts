import tee from "@/assets/product-tee.jpg";
import hoodie from "@/assets/product-hoodie.jpg";
import sweat from "@/assets/product-sweat.jpg";
import pant from "@/assets/product-pant.jpg";
import cap from "@/assets/product-cap.jpg";
import { getProductsFromSupabase } from "./supabase";

export type Category = "tees" | "hoodies" | "outer" | "pants" | "acc";

export interface Product {
  id: string;
  code: string;
  name: { en: string; ar: string };
  category: Category;
  price: number;
  image: string;
  fabric: { en: string; ar: string };
  description: { en: string; ar: string };
  sizes: string[];
  stock: Record<string, number>;
  rating: number;
  reviewCount: number;
}

export const PRODUCTS: Product[] = [
  {
    id: "core-tee-carbon",
    code: "V.01",
    name: { en: "Essential Tee / Carbon", ar: "تيشيرت أساسي / كربون" },
    category: "tees",
    price: 65,
    image: tee,
    fabric: { en: "Heavyweight Cotton 280GSM", ar: "قطن ثقيل ٢٨٠ جرام" },
    description: {
      en: "Cut from heavyweight combed cotton with a boxy silhouette and dropped shoulders. Garment-dyed for depth.",
      ar: "قماش قطني ثقيل مصفف، بقصة مربعة وأكتاف منسدلة. مصبوغ بعد الحياكة لعمق اللون.",
    },
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 12, M: 24, L: 18, XL: 6 },
    rating: 4.8,
    reviewCount: 142,
  },
  {
    id: "sculpt-hoodie-ash",
    code: "V.02",
    name: { en: "Sculpt Hoodie / Ash", ar: "هودي منحوت / رمادي" },
    category: "hoodies",
    price: 120,
    image: hoodie,
    fabric: { en: "Boxy Fit / French Terry 420GSM", ar: "قصة مربعة / تيري فرنسي ٤٢٠" },
    description: {
      en: "Architectural boxy hoodie in heavy French Terry with ember flat drawcords and reinforced kangaroo pocket.",
      ar: "هودي معماري بقصة مربعة من تيري فرنسي ثقيل مع أربطة جمر وجيب كنغر مقوى.",
    },
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 8, M: 16, L: 14, XL: 4 },
    rating: 4.9,
    reviewCount: 88,
  },
  {
    id: "orbit-crew-onyx",
    code: "V.03",
    name: { en: "Orbit Crewneck / Onyx", ar: "سويت شيرت أوربت / أونيكس" },
    category: "hoodies",
    price: 95,
    image: sweat,
    fabric: { en: "Loopback Cotton 380GSM", ar: "قطن حلقي ٣٨٠" },
    description: {
      en: "Oversized crewneck with high-neck construction and boxy body. Loopback cotton with a soft brushed interior.",
      ar: "سويت شيرت واسع بياقة عالية وقصة مربعة. قطن حلقي بداخل ناعم.",
    },
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 10, M: 12, L: 8, XL: 2 },
    rating: 4.7,
    reviewCount: 54,
  },
  {
    id: "utility-pant-slate",
    code: "P.01",
    name: { en: "Utility Pant / Slate", ar: "بنطلون يوتيليتي / سليت" },
    category: "pants",
    price: 145,
    image: pant,
    fabric: { en: "Cotton Ripstop 260GSM", ar: "قطن ريبستوب ٢٦٠" },
    description: {
      en: "Wide-leg utility trouser with articulated knees, elastic drawcord hem, and reinforced cargo pockets.",
      ar: "بنطلون واسع بركبتين مفصلتين ورباط مطاطي وجيوب كارجو مقواة.",
    },
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 6, M: 10, L: 12, XL: 4 },
    rating: 4.6,
    reviewCount: 37,
  },
  {
    id: "studio-cap-blackout",
    code: "A.01",
    name: { en: "Studio Icon Cap / Blackout", ar: "كاب استوديو / بلاك آوت" },
    category: "acc",
    price: 45,
    image: cap,
    fabric: { en: "Structured Twill / Woven Patch", ar: "تويل مبطن / شعار منسوج" },
    description: {
      en: "Six-panel structured cap with a low-profile crown, curved brim, and woven ember badge.",
      ar: "كاب مبطن من ست قطع بتاج منخفض وحافة منحنية وشعار جمر منسوج.",
    },
    sizes: ["One"],
    stock: { One: 30 },
    rating: 4.8,
    reviewCount: 61,
  },
  {
    id: "core-tee-ember",
    code: "V.04",
    name: { en: "Essential Tee / Ember", ar: "تيشيرت أساسي / جمر" },
    category: "tees",
    price: 65,
    image: tee,
    fabric: { en: "Heavyweight Cotton 280GSM", ar: "قطن ثقيل ٢٨٠ جرام" },
    description: {
      en: "The Essential Tee in a limited ember colorway. Boxy silhouette, garment-dyed for depth.",
      ar: "التيشيرت الأساسي بلون الجمر المحدود. قصة مربعة، مصبوغ لعمق اللون.",
    },
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 4, M: 8, L: 6, XL: 2 },
    rating: 4.7,
    reviewCount: 29,
  },
  {
    id: "architect-coat",
    code: "O.01",
    name: { en: "Architect Overcoat / Onyx", ar: "معطف المعماري / أونيكس" },
    category: "outer",
    price: 380,
    image: sweat,
    fabric: { en: "Wool Blend 480GSM", ar: "خلطة صوف ٤٨٠" },
    description: {
      en: "Long single-breasted overcoat in a heavy wool blend with hand-finished notch lapels and welt pockets.",
      ar: "معطف طويل بصدر واحد من خلطة صوف ثقيلة مع ياقة يدوية وجيوب مبطنة.",
    },
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 3, M: 5, L: 4, XL: 1 },
    rating: 4.9,
    reviewCount: 22,
  },
  {
    id: "boxy-hoodie-ember",
    code: "V.05",
    name: { en: "Sculpt Hoodie / Ember", ar: "هودي منحوت / جمر" },
    category: "hoodies",
    price: 120,
    image: hoodie,
    fabric: { en: "Boxy Fit / French Terry 420GSM", ar: "قصة مربعة / تيري فرنسي ٤٢٠" },
    description: {
      en: "The Sculpt Hoodie in an ember-accented colorway. Architectural boxy fit.",
      ar: "هودي منحوت بألوان الجمر. قصة معمارية واسعة.",
    },
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 5, M: 9, L: 7, XL: 2 },
    rating: 4.8,
    reviewCount: 41,
  },
  {
    id: "daily-tee-ivory",
    code: "V.06",
    name: { en: "Daily Tee / Ivory", ar: "تيشيرت يومي / أبيض عاجي" },
    category: "tees",
    price: 58,
    image: tee,
    fabric: { en: "Soft Cotton Jersey 220GSM", ar: "جيرسي قطني ناعم ٢٢٠" },
    description: {
      en: "A relaxed everyday tee made for comfort, with a clean neckline and soft hand feel.",
      ar: "تيشيرت يومي مريح للارتداء اليومي، بق neckline بسيط وملمس ناعم.",
    },
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 11, M: 14, L: 10, XL: 5 },
    rating: 4.6,
    reviewCount: 33,
  },
  {
    id: "street-hoodie-sand",
    code: "V.07",
    name: { en: "Street Hoodie / Sand", ar: "هودي ستريت / رمل" },
    category: "hoodies",
    price: 132,
    image: hoodie,
    fabric: { en: "Heavy Cotton Fleece 360GSM", ar: "فليسي قطني ثقيل ٣٦٠" },
    description: {
      en: "A versatile hoodie with a roomy fit, soft fleece interior, and durable stitching.",
      ar: "هودي متعدد الاستخدام بقصة roomy وداخل فليسي ناعم وخياطة متينة.",
    },
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 7, M: 10, L: 8, XL: 3 },
    rating: 4.7,
    reviewCount: 26,
  },
  {
    id: "cargo-pant-olive",
    code: "P.02",
    name: { en: "Cargo Pant / Olive", ar: "بنطلون كارجو / زيتوني" },
    category: "pants",
    price: 118,
    image: pant,
    fabric: { en: "Cotton Blend Twill 280GSM", ar: "خلطة قطن تويل ٢٨٠" },
    description: {
      en: "Straight-leg cargo pants with multiple pockets and an easy everyday silhouette.",
      ar: "بنطلون كارجو بقصة مستقيمة مع عدّة جيوب ومظهر يومي مريح.",
    },
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 8, M: 12, L: 9, XL: 4 },
    rating: 4.5,
    reviewCount: 18,
  },
  {
    id: "woven-cap-cream",
    code: "A.02",
    name: { en: "Woven Cap / Cream", ar: "قبعة منسوجة / كريم" },
    category: "acc",
    price: 39,
    image: cap,
    fabric: { en: "Cotton Woven Structure", ar: "بنية منسوجة من القطن" },
    description: {
      en: "A lightweight cap with a clean woven finish and subtle branding.",
      ar: "قبعة خفيفة بنهاية منسوجة أنيقة وعلامة تجارية خفيفة.",
    },
    sizes: ["One"],
    stock: { One: 20 },
    rating: 4.6,
    reviewCount: 15,
  },
];

let activeProducts: Product[] = [...PRODUCTS];
const CATALOG_STORAGE = "aimowear.catalog";

function readCatalogProducts(): Product[] {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Product[];
    }
  } catch {}
  return [];
}

function writeCatalogProducts(products: Product[]) {
  try {
    localStorage.setItem(CATALOG_STORAGE, JSON.stringify(products));
  } catch {}
}

function pickImage(category: Category): string {
  switch (category) {
    case "hoodies":
      return hoodie;
    case "outer":
      return sweat;
    case "pants":
      return pant;
    case "acc":
      return cap;
    default:
      return tee;
  }
}

function normalizeSupabaseProduct(row: Record<string, unknown>): Product {
  const category = String(row.category || "tees") as Category;
  const sizes = Array.isArray(row.sizes)
    ? row.sizes.map((item) => String(item))
    : typeof row.sizes === "string"
      ? row.sizes.split(",").map((item) => item.trim()).filter(Boolean)
      : ["S", "M", "L", "XL"];

  const stockRaw = row.stock;
  let stock: Record<string, number> = {};
  if (stockRaw && typeof stockRaw === "object" && !Array.isArray(stockRaw)) {
    Object.entries(stockRaw as Record<string, unknown>).forEach(([key, value]) => {
      stock[key] = Number(value) || 0;
    });
  }
  if (Object.keys(stock).length === 0) {
    sizes.forEach((size) => {
      stock[size] = 10;
    });
  }

  const rawName = row.name as Record<string, unknown> | undefined;
  const rawFabric = row.fabric as Record<string, unknown> | undefined;
  const rawDescription = row.description as Record<string, unknown> | undefined;

  return {
    id: String(row.id || ""),
    code: String(row.code || ""),
    name: {
      en: String(row.name_en || rawName?.en || "Untitled"),
      ar: String(row.name_ar || rawName?.ar || "بدون عنوان"),
    },
    category,
    price: Number(row.price) || 0,
    image: String(row.image || pickImage(category)),
    fabric: {
      en: String(row.fabric_en || rawFabric?.en || "Standard fabric"),
      ar: String(row.fabric_ar || rawFabric?.ar || "قماش قياسي"),
    },
    description: {
      en: String(row.description_en || rawDescription?.en || "No description available"),
      ar: String(row.description_ar || rawDescription?.ar || "لا يوجد وصف"),
    },
    sizes,
    stock,
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count || row.reviewCount) || 0,
  };
}

export function getCatalogProducts(): Product[] {
  const stored = readCatalogProducts();
  if (stored.length > 0) return stored;
  return activeProducts;
}

export function createCatalogProduct(product: Product): Product {
  const stored = readCatalogProducts();
  const next = [product, ...stored];
  writeCatalogProducts(next);
  activeProducts = next;
  return product;
}

export function deleteCatalogProduct(id: string): Product[] {
  const stored = readCatalogProducts();
  const next = stored.filter((item) => item.id !== id);
  writeCatalogProducts(next);
  activeProducts = next;
  return next;
}

export async function loadProducts(): Promise<Product[]> {
  const remoteRows = await getProductsFromSupabase();
  if (remoteRows && remoteRows.length > 0) {
    const mapped = remoteRows.map((row) => normalizeSupabaseProduct(row as Record<string, unknown>));
    activeProducts = mapped;
    return mapped;
  }

  activeProducts = [...PRODUCTS];
  return activeProducts;
}

export function getProduct(id: string): Product | undefined {
  return getCatalogProducts().find((p) => p.id === id);
}

export function totalStock(p: Product): number {
  return Object.values(p.stock).reduce((a, b) => a + b, 0);
}
