import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getProduct, loadProducts, type Product } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { useCart, getEffectiveStock } from "@/lib/cart";
import { useReviews } from "@/lib/reviews";
import { useCurrency } from "@/lib/currency";
import { AuthGateModal } from "@/components/site/AuthGate";
import { isLoggedIn } from "@/lib/auth";
import { SITE_URL, generateProductSchema, generateBreadcrumbSchema } from "@/components/site/SEO";
import { useEffect, useMemo, useState } from "react";
import { Star, Minus, Plus, Lock } from "lucide-react";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  notFoundComponent: () => (
    <div className="p-20 text-center">
      <h1 className="font-display text-4xl italic">Product not found</h1>
      <Link to="/shop" className="text-primary mt-4 inline-block">Back to shop</Link>
    </div>
  ),
});

function ProductPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | undefined>(() => getProduct(id));
  const { t, lang } = useI18n();
  const { add, stockVersion } = useCart();
  const { formatCurrency } = useCurrency();
  const { forProduct, add: addReview } = useReviews();
  const navigate = useNavigate();
  const [size, setSize] = useState(product?.sizes[0] ?? "M");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [hideSoldOut, setHideSoldOut] = useState(true);

  // Auth gate state
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authGateAction, setAuthGateAction] = useState("");
  const [pendingTask, setPendingTask] = useState<(() => void) | null>(null);

  // Reviews form
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    let active = true;
    loadProducts().then((list) => {
      if (!active) return;
      const found = list.find((item) => item.id === id);
      setProduct(found ?? getProduct(id));
    });
    return () => {
      active = false;
    };
  }, [id]);

  // Client-side SEO: dynamic title, meta description, and Product/Breadcrumb JSON-LD.
  useEffect(() => {
    if (!product) return;
    document.title = `${product.name.en} — AimoWear`;
    const jsonld = [
      generateProductSchema({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        rating: product.rating,
        reviewCount: product.reviewCount,
        image: product.image,
      }),
      generateBreadcrumbSchema([
        { name: "Shop", url: `${SITE_URL}/shop` },
        { name: product.name.en, url: `${SITE_URL}/product/${product.id}` },
      ]),
    ];
    const existing = document.getElementById("aimo-jsonld-product");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "aimo-jsonld-product";
    script.text = JSON.stringify(jsonld);
    document.head.appendChild(script);
    return () => {
      document.getElementById("aimo-jsonld-product")?.remove();
    };
  }, [product]);

  const stockBySize = useMemo(() => {
    if (!product) return {} as Record<string, number>;
    const out: Record<string, number> = {};
    for (const s of product.sizes) out[s] = getEffectiveStock(product.id, s);
    return out;
  }, [product?.id, stockVersion]);

  if (!product) {
    return (
      <div className="p-20 text-center">
        <h1 className="font-display text-4xl italic">Product not found</h1>
        <Link to="/shop" className="text-primary mt-4 inline-block underline">Back to shop</Link>
      </div>
    );
  }

  const reviews = forProduct(product.id);
  const combinedCount = product.reviewCount + reviews.length;
  const combinedRating =
    reviews.length === 0
      ? product.rating
      : (product.rating * product.reviewCount + reviews.reduce((a, r) => a + r.rating, 0)) / combinedCount;

  const maxQty = Math.max(0, stockBySize[size] ?? 0);
  const soldOut = maxQty === 0;

  const executeAdd = () => {
    if (soldOut) return;
    add({
      productId: product.id,
      name: product.name[lang],
      image: product.image,
      price: product.price,
      size,
      quantity: Math.min(qty, maxQty),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleAdd = () => {
    if (!isLoggedIn()) {
      setAuthGateAction("add items to your cart");
      setPendingTask(() => executeAdd);
      setShowAuthGate(true);
      return;
    }
    executeAdd();
  };

  const handleCustomizeClick = () => {
    if (!isLoggedIn()) {
      setAuthGateAction("enter the custom studio");
      setPendingTask(() => () => navigate({ to: "/custom", search: { base: product.id } as never }));
      setShowAuthGate(true);
      return;
    }
    navigate({ to: "/custom", search: { base: product.id } as never });
  };

  const executeReview = () => {
    if (!reviewName.trim() || !reviewText.trim()) return;
    addReview({ productId: product.id, author: reviewName.trim(), rating: reviewRating, comment: reviewText.trim() });
    setReviewName(""); setReviewText(""); setReviewRating(5);
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      setAuthGateAction("write product reviews");
      setPendingTask(() => executeReview);
      setShowAuthGate(true);
      return;
    }
    executeReview();
  };

  return (
    <div className="page-enter">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12">
        <div className="bg-surface aspect-square md:aspect-auto md:min-h-[80vh]">
          <img src={product.image} alt={product.name.en} className="w-full h-full object-cover" />
        </div>
        <div className="p-8 md:p-16 flex flex-col justify-center max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary mb-4 font-bold">{product.code}</p>
          <h1 className="font-display text-4xl md:text-6xl italic mb-4">{product.name[lang]}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl text-primary">{formatCurrency(product.price)}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span>{combinedRating.toFixed(1)}</span>
              <span>({combinedCount})</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">{product.description[lang]}</p>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("product.size")}</p>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={hideSoldOut} onChange={(e) => setHideSoldOut(e.target.checked)} className="accent-primary" />
                In stock only
              </label>
            </div>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.filter((s) => !hideSoldOut || (stockBySize[s] ?? 0) > 0).map((s) => {
                const n = stockBySize[s] ?? 0;
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => { setSize(s); setQty(1); }}
                    disabled={n === 0}
                    className={`min-w-12 px-4 py-3 text-xs uppercase tracking-widest border transition-colors disabled:opacity-30 disabled:line-through ${size === s ? "border-primary bg-primary text-white" : "border-border hover:border-white"}`}
                  >{s}</button>
                );
              })}
            </div>
            <p className="text-[10px] uppercase tracking-widest mt-3">
              {soldOut ? (
                <span className="text-primary">Sold out</span>
              ) : maxQty <= 3 ? (
                <span className="text-primary inline-flex items-center gap-2">
                  <span className="inline-block size-1.5 rounded-full bg-primary pulse-ring" />
                  Only {maxQty} left in size {size}
                </span>
              ) : (
                <span className="text-muted-foreground">{maxQty} in stock · size {size}</span>
              )}
            </p>
          </div>

          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">{t("product.qty")}</p>
            <div className="inline-flex items-center border border-border">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:bg-surface"><Minus className="h-3 w-3" /></button>
              <span className="px-6 text-sm">{qty}</span>
              <button type="button" onClick={() => setQty(Math.min(maxQty || 1, qty + 1))} className="px-4 py-3 hover:bg-surface"><Plus className="h-3 w-3" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut}
              className="bg-primary text-white px-8 py-5 text-xs uppercase tracking-[0.3em] font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {soldOut ? "Sold Out" : added ? "✓ Added" : t("product.addToCart")}
            </button>
            <button
              type="button"
              onClick={handleCustomizeClick}
              className="border border-border px-8 py-5 text-xs uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-background transition-all"
            >
              Option 1: {t("hero.cta.design")}
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{t("product.details")}</p>
            <p className="text-sm">{product.fabric[lang]}</p>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <section className="max-w-4xl mx-auto px-8 py-20 border-t border-border">
        <h2 className="font-display text-3xl md:text-4xl italic mb-2">{t("product.reviews")}</h2>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-10">{combinedCount} reviews · {combinedRating.toFixed(1)} average</p>

        <div className="space-y-6 mb-16">
          {reviews.length === 0 && <p className="text-sm text-muted-foreground">Be the first to review this piece.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-border pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  ))}
                </div>
                <span className="text-sm">{r.author}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">{r.comment}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submitReview} className="bg-surface border border-border p-6 space-y-4">
          <h3 className="text-xs uppercase tracking-[0.3em] font-bold">{t("product.writeReview")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
            <input required value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Your name" className="bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setReviewRating(n)} aria-label={`${n} star`}>
                  <Star className={`h-5 w-5 ${n <= reviewRating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <textarea required value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience…" rows={4} className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary resize-none" />
          <button type="submit" className="bg-primary text-white px-6 py-3 text-xs uppercase tracking-[0.3em] font-bold hover:brightness-110">{t("product.submitReview")}</button>
        </form>
      </section>

      {/* Auth Gate modal */}
      <AuthGateModal
        isOpen={showAuthGate}
        actionName={authGateAction}
        onClose={() => setShowAuthGate(false)}
        onSuccess={() => {
          if (pendingTask) {
            pendingTask();
            setPendingTask(null);
          }
        }}
      />
    </div>
  );
}
