import { createFileRoute, Link } from "@tanstack/react-router";
import heroModel from "@/assets/hero-model.jpg";
import heroVideo from "@/assets/hero-promo.mp4";
import catTees from "@/assets/cat-tees.jpg";
import catHoodies from "@/assets/cat-hoodies.jpg";
import catOuter from "@/assets/cat-outer.jpg";
import mockupTee from "@/assets/mockup-tee-black.jpg";
import { PRODUCTS } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Shirt, Upload, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { t, lang } = useI18n();
  const { formatCurrency } = useCurrency();
  const featured = PRODUCTS.slice(0, 4);
  const heroMarquee = [
    "AimoWear Studio",
    "Amman · Est. 2026",
    "Precision Custom Design",
    "BYOP Print Service",
    "Editorial Essentials",
    `Free Shipping Over ${formatCurrency(150)}`,
  ];
  useScrollReveal();

  return (
      <>
      <section className="relative w-full h-[90vh] overflow-hidden flex items-end pb-20 px-8 md:px-16">
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover"
            poster={heroModel}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            controls={false}
          >
            <source src={heroVideo} type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/10 to-transparent" />
        </div>
        <div className="relative z-10 max-w-4xl reveal-up" style={{ animationDelay: "0.2s" }}>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.85] italic mb-6">
            {t("hero.title.1")} <br />{t("hero.title.2")}
          </h1>
          <p className="max-w-md text-base md:text-lg text-muted-foreground mb-8 font-light leading-relaxed">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/shop" className="bg-primary text-white px-8 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:brightness-110 transition-all">
              {t("hero.cta.shop")}
            </Link>
            <Link to="/custom" className="border border-white/20 px-8 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-background transition-all">
              {t("hero.cta.design")}
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial marquee */}
      <div className="border-y border-border overflow-hidden py-6 bg-surface/40">
        <div className="flex whitespace-nowrap marquee gap-16 font-display italic text-3xl md:text-4xl">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-16 shrink-0">
              {heroMarquee.map((w, i) => (
                <span key={i} className="text-muted-foreground/70 flex items-center gap-16 shrink-0">
                  {w}
                  <span className="text-primary text-lg not-italic">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 3 Core Options Section */}
      <section className="py-20 px-8 max-w-7xl mx-auto border-b border-border">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary mb-3 font-bold">Studio Pillars</p>
          <h2 className="font-display text-4xl md:text-5xl italic">Three Ways to Express Your Style</h2>
          <p className="text-xs text-muted-foreground mt-3">From ready-to-wear brand drops to precision custom printing on your own garments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Option 1 */}
          <div className="bg-surface border border-border p-8 flex flex-col justify-between group hover:border-primary transition-all">
            <div>
              <div className="size-12 rounded-full bg-primary/10 border border-primary/30 grid place-items-center mb-6 text-primary">
                <Shirt className="h-6 w-6" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Option 01</p>
              <h3 className="font-display text-2xl italic mb-3">Print on AimoWear Blanks</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose any item from our heavy-cotton catalog (tees, hoodies, pants) and apply your custom graphics & statements.
              </p>
            </div>
            <Link
              to="/custom"
              search={{ mode: "aimo" } as never}
              className="mt-8 text-xs uppercase tracking-[0.2em] font-bold text-primary flex items-center gap-2 group-hover:translate-x-1 transition-transform"
            >
              Enter Custom Studio →
            </Link>
          </div>

          {/* Option 2 */}
          <div className="bg-surface border border-border p-8 flex flex-col justify-between group hover:border-primary transition-all">
            <div>
              <div className="size-12 rounded-full bg-primary/10 border border-primary/30 grid place-items-center mb-6 text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Option 02</p>
              <h3 className="font-display text-2xl italic mb-3">Bring Your Own Product</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Have a favorite garment already? Upload its photo to design your print. Flat rate {formatCurrency(25)} studio printing service fee.
              </p>
            </div>
            <Link
              to="/custom"
              search={{ mode: "byop" } as never}
              className="mt-8 text-xs uppercase tracking-[0.2em] font-bold text-primary flex items-center gap-2 group-hover:translate-x-1 transition-transform"
            >
              Upload Your Item →
            </Link>
          </div>

          {/* Option 3 */}
          <div className="bg-surface border border-border p-8 flex flex-col justify-between group hover:border-primary transition-all">
            <div>
              <div className="size-12 rounded-full bg-primary/10 border border-primary/30 grid place-items-center mb-6 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Option 03</p>
              <h3 className="font-display text-2xl italic mb-3">AimoWear Brand Collection</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Shop our signature ready-to-wear editorial streetwear pieces crafted from 280GSM-420GSM premium fabrics.
              </p>
            </div>
            <Link
              to="/shop"
              className="mt-8 text-xs uppercase tracking-[0.2em] font-bold text-primary flex items-center gap-2 group-hover:translate-x-1 transition-transform"
            >
              Shop Collection →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full py-24 px-8">
        <div className="flex justify-between items-end mb-12 reveal-on-scroll">
          <h2 className="font-display text-4xl md:text-5xl">{t("featured.title")}</h2>
          <Link to="/shop" className="text-xs uppercase tracking-widest text-primary border-b border-primary pb-1">
            {t("featured.viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featured.map((p, idx) => (
            <Link to="/product/$id" params={{ id: p.id }} key={p.id} className="group cursor-pointer reveal-on-scroll" data-reveal-delay={`${idx * 90}ms`}>
              <div className="aspect-[3/4] bg-surface border border-border/20 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name.en}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 flex justify-between items-start gap-2">
                <h3 className="text-sm font-medium">{p.name[lang]}</h3>
                <span className="text-primary text-sm shrink-0">{formatCurrency(p.price)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase mt-1 tracking-tighter">{p.fabric[lang]}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Category Bands */}
      <section className="w-full flex flex-col">
        {[
          { name: { en: "Tees", ar: "تيشيرت" }, sub: { en: "Essential Foundations", ar: "الأساسيات" }, count: 12, cat: "tees" as const, img: catTees },
          { name: { en: "Hoodies", ar: "هوديز" }, sub: { en: "Architectural Comfort", ar: "راحة معمارية" }, count: 8, cat: "hoodies" as const, img: catHoodies },
          { name: { en: "Outerwear", ar: "معاطف" }, sub: { en: "Statement Silhouettes", ar: "قصات مميزة" }, count: 6, cat: "outer" as const, img: catOuter },
        ].map((c, i) => (
          <Link to="/shop" search={{ c: c.cat } as never} key={c.cat} className="group relative h-[30vh] md:h-[40vh] border-b border-border overflow-hidden block reveal-on-scroll" data-reveal-delay={`${i * 120}ms`}>
            <img src={c.img} alt={c.name.en} width={1600} height={600} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
            <div className="relative h-full flex items-center px-8 md:px-16">
              <span className="font-display text-7xl md:text-[10rem] italic opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all duration-700 select-none">
                {c.name[lang]}
              </span>
              <div className="ml-auto text-right rtl:text-left rtl:ml-0 rtl:mr-auto">
                <p className="text-xs uppercase tracking-[0.3em] font-medium">{c.sub[lang]}</p>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase">Shop {c.count} Styles →</p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Brand Story */}
      <section className="w-full py-32 px-8 flex justify-center">
        <div className="max-w-2xl text-center reveal-on-scroll">
          <h4 className="text-[10px] uppercase tracking-[0.4em] text-primary mb-8 font-bold">{t("story.eyebrow")}</h4>
          <p className="font-display text-3xl md:text-5xl italic leading-tight text-balance mb-8">{t("story.body")}</p>
          <div className="w-px h-24 bg-gradient-to-b from-primary to-transparent mx-auto" />
        </div>
      </section>

      {/* Newsletter */}
      <section className="w-full py-20 px-8 border-t border-border bg-surface">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 max-w-7xl mx-auto">
          <div>
            <h3 className="text-2xl font-display italic mb-2">{t("newsletter.title")}</h3>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("newsletter.sub")}</p>
          </div>
          <form className="w-full md:w-96 flex border-b border-border" onSubmit={(e) => { e.preventDefault(); alert("Thanks!"); }}>
            <input type="email" required placeholder={t("newsletter.placeholder")} className="w-full py-4 bg-transparent outline-none text-xs tracking-widest placeholder:text-muted-foreground/50" />
            <button type="submit" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors px-2">{t("newsletter.cta")}</button>
          </form>
        </div>
      </section>
    </>
  );
}
