import { createFileRoute, Link } from "@tanstack/react-router";
import { getCatalogProducts, loadProducts, type Category, type Product } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { useCart, getEffectiveStock } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useEffect, useMemo, useState } from "react";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

interface ShopSearch { c?: Category }

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({ c: s.c as Category | undefined }),
  component: Shop,
});

function Shop() {
  const { t, lang } = useI18n();
  const { stockVersion } = useCart();
  const { formatCurrency } = useCurrency();
  const search = Route.useSearch();
  const [cat, setCat] = useState<Category | "all">(search.c ?? "all");
  const [sizeFilter, setSizeFilter] = useState<string | "any">("any");
  const [products, setProducts] = useState<Product[]>(() => getCatalogProducts());

  useEffect(() => {
    let active = true;
    loadProducts().then((list) => {
      if (active) setProducts(list);
    });
    return () => {
      active = false;
    };
  }, []);

  const filters: { key: Category | "all"; label: string }[] = [
    { key: "all", label: t("shop.filter.all") },
    { key: "tees", label: t("shop.filter.tees") },
    { key: "hoodies", label: t("shop.filter.hoodies") },
    { key: "outer", label: t("shop.filter.outer") },
    { key: "pants", label: t("shop.filter.pants") },
    { key: "acc", label: t("shop.filter.acc") },
  ];

  // Which sizes exist in current category
  const availableSizes = useMemo(() => {
    const base = cat === "all" ? products : products.filter((p) => p.category === cat);
    const set = new Set<string>();
    base.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return ALL_SIZES.filter((s) => set.has(s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat]);

  const visibleProducts = useMemo(() => {
    let list = cat === "all" ? products : products.filter((p) => p.category === cat);
    if (sizeFilter !== "any") {
      list = list.filter((p) => p.sizes.includes(sizeFilter) && getEffectiveStock(p.id, sizeFilter) > 0);
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, sizeFilter, stockVersion]);

  return (
    <div className="px-8 py-16 md:py-24">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.4em] text-primary mb-4 font-bold">AW / 2026</p>
        <h1 className="font-display text-5xl md:text-7xl italic">{t("shop.title")}</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 border-b border-border pb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => { setCat(f.key); setSizeFilter("any"); }}
            className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold border transition-colors ${cat === f.key ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:text-white hover:border-white"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-12">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Filter by size · in stock</span>
        <button
          onClick={() => setSizeFilter("any")}
          className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-colors ${sizeFilter === "any" ? "bg-white border-white text-background" : "border-border text-muted-foreground hover:border-white hover:text-white"}`}
        >Any</button>
        {availableSizes.map((s) => (
          <button
            key={s}
            onClick={() => setSizeFilter(s)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-colors ${sizeFilter === s ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:border-white hover:text-white"}`}
          >{s}</button>
        ))}
      </div>


      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {visibleProducts.map((p) => (
          <Link to="/product/$id" params={{ id: p.id }} key={p.id} className="group">
            <div className="aspect-[3/4] bg-surface overflow-hidden border border-border/20">
              <img src={p.image} alt={p.name.en} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            </div>
            <div className="mt-4 flex justify-between items-start gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{p.code}</p>
                <h3 className="text-sm font-medium">{p.name[lang]}</h3>
              </div>
              <span className="text-primary text-sm shrink-0">{formatCurrency(p.price)}</span>
            </div>
          </Link>
        ))}
      </div>

      {visibleProducts.length === 0 && (
        <p className="text-center text-muted-foreground py-20 uppercase tracking-widest text-xs">No products in this category yet.</p>
      )}
    </div>
  );
}
