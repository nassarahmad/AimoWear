export const SITE_URL = "https://aimowear.com";

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AimoWear Studio",
    url: SITE_URL,
    logo: `${SITE_URL}/aw-icon.png`,
    image: `${SITE_URL}/aw-icon.png`,
    sameAs: [
      "https://instagram.com/aimowear",
      "https://facebook.com/aimowear",
      "https://tiktok.com/@aimowear",
    ],
    description:
      "Premium fashion brand blending ready-to-wear editorial streetwear with custom apparel studio printing.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Amman",
      addressCountry: "JO",
    },
  };
}

export function generateProductSchema(product: {
  id: string;
  name: { en: string; ar: string };
  price: number;
  description: { en: string; ar: string };
  rating: number;
  reviewCount: number;
  image: string;
}) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name.en,
    image: [product.image],
    description: product.description.en,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "AimoWear",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: "USD",
      price: product.price,
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 1,
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
