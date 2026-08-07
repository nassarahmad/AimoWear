import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { AuthGate, AuthGateModal } from "@/components/site/AuthGate";
import { getProduct, getCatalogProducts, type Product } from "@/lib/products";
import { isLoggedIn } from "@/lib/auth";
import { useRef, useState, useMemo } from "react";
import mockupWhite from "@/assets/mockup-tee-white.jpg";
import mockupBlack from "@/assets/mockup-tee-black.jpg";
import { Upload, Type, X, Shirt, Image as ImageIcon, Sparkles } from "lucide-react";

interface CustomSearch {
  base?: string;
  mode?: "aimo" | "byop";
}

export const Route = createFileRoute("/custom")({
  validateSearch: (s: Record<string, unknown>): CustomSearch => ({
    base: s.base as string | undefined,
    mode: (s.mode as "aimo" | "byop") || undefined,
  }),
  component: CustomStudio,
});

type Color = "black" | "white" | "charcoal";
type Position = "front" | "back" | "sleeve";
type StudioMode = "aimo" | "byop"; // aimo = Option 1 (AimoWear Canvas), byop = Option 2 (Bring Your Own Product)

export function CustomStudio() {
  const { t, lang } = useI18n();
  const { formatCurrency } = useCurrency();
  const { add } = useCart();
  const navigate = useNavigate();
  const search = Route.useSearch();

  // Mode: Option 1 (AimoWear Canvas) vs Option 2 (Bring Your Own Product - BYOP)
  const [studioMode, setStudioMode] = useState<StudioMode>(search.mode ?? "aimo");

  // Option 1 Catalog selection
  const catalog = useMemo(() => getCatalogProducts(), []);
  const [selectedProductId, setSelectedProductId] = useState<string>(search.base ?? catalog[0]?.id ?? "core-tee-carbon");
  const selectedProduct = useMemo(() => getProduct(selectedProductId), [selectedProductId]);

  // Option 2 (BYOP) uploaded product photo
  const [ownProductPhoto, setOwnProductPhoto] = useState<string | null>(null);
  const ownProductRef = useRef<HTMLInputElement>(null);

  // Common controls
  const [color, setColor] = useState<Color>("black");
  const [position, setPosition] = useState<Position>("front");
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState<"white" | "ember" | "black">("white");
  const [uploadedArtwork, setUploadedArtwork] = useState<string | null>(null);
  const [size, setSize] = useState("M");
  const [showAuthGate, setShowAuthGate] = useState(false);
  const artworkRef = useRef<HTMLInputElement>(null);

  // Pricing Calculation
  const price = useMemo(() => {
    if (studioMode === "byop") {
      return 25 + (text ? 8 : 0);
    }
    const basePrice = selectedProduct ? selectedProduct.price : 55;
    return basePrice + (uploadedArtwork ? 15 : 0) + (text ? 8 : 0);
  }, [studioMode, selectedProduct, uploadedArtwork, text]);

  // Preview Mockup Image logic
  const previewImage = useMemo(() => {
    if (studioMode === "byop") {
      return ownProductPhoto;
    }
    if (selectedProduct) {
      return selectedProduct.image;
    }
    return color === "white" ? mockupWhite : mockupBlack;
  }, [studioMode, ownProductPhoto, selectedProduct, color]);

  const colorClass = { black: "#0f0f0f", white: "#f5f5f5", charcoal: "#2d2d2d" }[color];

  const handleArtworkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedArtwork(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleOwnProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setOwnProductPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const executeAddToCart = () => {
    if (studioMode === "byop" && !ownProductPhoto) {
      alert("Please upload a photo of your product first!");
      return;
    }

    const itemName = studioMode === "byop"
      ? `${lang === "ar" ? "خدمة طباعة على منتجك الخارجي" : "Custom Print Service (BYOP)"}`
      : `${selectedProduct ? selectedProduct.name[lang] : "Custom Tee"} · Custom Print`;

    const itemImage = previewImage || mockupBlack;

    add({
      productId: studioMode === "byop" ? `byop-${Date.now()}` : (selectedProduct?.id ?? "custom-tee"),
      name: itemName,
      image: itemImage,
      price,
      size: studioMode === "byop" ? "Custom Size" : size,
      quantity: 1,
      custom: {
        baseColor: color,
        position,
        text: text || undefined,
        textColor,
        imageDataUrl: uploadedArtwork ?? undefined,
      },
    });

    navigate({ to: "/cart" });
  };

  const handleAddToCartClick = () => {
    if (!isLoggedIn()) {
      setShowAuthGate(true);
      return;
    }
    executeAddToCart();
  };

  const overlayPos = {
    front: { top: "38%", left: "50%" },
    back: { top: "35%", left: "50%" },
    sleeve: { top: "40%", left: "25%" },
  }[position];

  return (
    <AuthGate title="Sign in to enter the studio" description="Customize AimoWear products with uploads, text, and print-ready designs. Requires an active account to save and purchase your build.">
      <div className="min-h-screen page-enter">
        {/* Header Banner */}
        <div className="px-8 py-10 border-b border-border bg-surface/30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-primary mb-2 font-bold">{t("custom.badge")}</p>
              <h1 className="font-display text-4xl md:text-5xl italic">
                {t("custom.title.1")} {t("custom.title.2")}
              </h1>
              <p className="text-xs text-muted-foreground mt-2 max-w-xl">
                Choose your printing model below: Print on our signature AimoWear blanks, or bring your own item for custom studio printing.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 border border-border px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:border-primary hover:text-primary transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Option 3: Shop Ready Brand Items →
            </Link>
          </div>
        </div>

        {/* Mode Selector Tabs (Option 1 vs Option 2) */}
        <div className="border-b border-border bg-background">
          <div className="max-w-7xl mx-auto px-8 flex flex-wrap gap-4 py-4">
            <button
              onClick={() => setStudioMode("aimo")}
              className={`flex items-center gap-3 px-6 py-3 border text-xs uppercase tracking-[0.2em] font-bold transition-all ${
                studioMode === "aimo"
                  ? "bg-primary border-primary text-white shadow-lg"
                  : "border-border text-muted-foreground hover:border-white hover:text-white"
              }`}
            >
              <Shirt className="h-4 w-4" />
              <span>Option 1: Print on AimoWear Apparel</span>
            </button>

            <button
              onClick={() => setStudioMode("byop")}
              className={`flex items-center gap-3 px-6 py-3 border text-xs uppercase tracking-[0.2em] font-bold transition-all ${
                studioMode === "byop"
                  ? "bg-primary border-primary text-white shadow-lg"
                  : "border-border text-muted-foreground hover:border-white hover:text-white"
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Option 2: Bring Your Own Product ({formatCurrency(25)} Flat Print Fee)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]">
          {/* Left Side: Interactive Preview Canvas */}
          <div className="bg-surface p-6 md:p-12 flex flex-col items-center justify-center min-h-[65vh] relative border-b lg:border-b-0 border-border">
            {studioMode === "byop" && !ownProductPhoto ? (
              <div className="w-full max-w-md p-10 border-2 border-dashed border-primary/40 rounded-lg text-center space-y-4 bg-background/50">
                <ImageIcon className="h-12 w-12 text-primary mx-auto opacity-80" />
                <h3 className="font-display text-2xl italic">Upload Your Product Photo</h3>
                <p className="text-xs text-muted-foreground">
                  Take a photo of your hoodie, t-shirt, or jacket. Upload it here to visualize your print design on your own garment!
                </p>
                <input ref={ownProductRef} type="file" accept="image/*" hidden onChange={handleOwnProductUpload} />
                <button
                  onClick={() => ownProductRef.current?.click()}
                  className="bg-primary text-white px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold hover:brightness-110"
                >
                  Select Product Image
                </button>
              </div>
            ) : (
              <div className="relative w-full max-w-lg aspect-square" style={{ backgroundColor: studioMode === "aimo" ? colorClass : "transparent" }}>
                <img
                  src={previewImage || mockupBlack}
                  alt="Custom preview"
                  className="w-full h-full object-contain transition-opacity duration-300"
                />
                
                {/* Artwork & Text Overlay */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-2 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
                  style={{ top: overlayPos.top, left: overlayPos.left, width: "38%", height: "38%" }}
                >
                  {uploadedArtwork && (
                    <img src={uploadedArtwork} alt="Uploaded artwork" className="max-w-full max-h-[75%] object-contain" />
                  )}
                  {text && (
                    <div
                      className="font-display italic text-2xl md:text-3xl text-center leading-tight drop-shadow-md"
                      style={{ color: textColor === "ember" ? "#e85d3a" : textColor === "white" ? "#fff" : "#000" }}
                    >
                      {text}
                    </div>
                  )}
                  {!uploadedArtwork && !text && (
                    <div className="border-2 border-dashed border-primary/50 w-full h-full grid place-items-center text-[10px] uppercase tracking-widest text-primary/80 bg-primary/5">
                      {t("custom.preview")}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between w-full max-w-lg text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Studio Mode: {studioMode === "byop" ? "BYOP (Bring Your Own Product)" : "AimoWear Canvas"}</span>
              <span>Print Location: {position}</span>
            </div>
          </div>

          {/* Right Side: Design Controls Panel */}
          <div className="p-6 md:p-8 border-l border-border space-y-8 bg-background">
            
            {/* Option 1: Select Base AimoWear Product */}
            {studioMode === "aimo" && (
              <section className="bg-surface p-4 border border-border">
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-3">01 · Choose AimoWear Garment</p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {catalog.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProductId(p.id); setSize(p.sizes[0] || "M"); }}
                      className={`flex items-center gap-2 p-2 border text-left transition-all ${
                        selectedProductId === p.id ? "border-primary bg-primary/10" : "border-border hover:border-white/50"
                      }`}
                    >
                      <img src={p.image} alt={p.name.en} className="w-10 h-10 object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{p.name[lang]}</p>
                        <p className="text-[10px] text-primary">{formatCurrency(p.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Option 2: BYOP Upload / Change Garment Photo */}
            {studioMode === "byop" && (
              <section className="bg-surface p-4 border border-border">
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">01 · Garment Photo (BYOP)</p>
                <input ref={ownProductRef} type="file" accept="image/*" hidden onChange={handleOwnProductUpload} />
                {ownProductPhoto ? (
                  <div className="flex items-center justify-between gap-3 border border-border p-2 bg-background">
                    <div className="flex items-center gap-3">
                      <img src={ownProductPhoto} alt="Product" className="w-12 h-12 object-cover border border-border" />
                      <div>
                        <p className="text-xs font-medium">Your Product Photo</p>
                        <p className="text-[10px] text-muted-foreground">Ready for print service</p>
                      </div>
                    </div>
                    <button
                      onClick={() => ownProductRef.current?.click()}
                      className="text-[10px] uppercase tracking-widest text-primary hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => ownProductRef.current?.click()}
                    className="w-full border border-dashed border-border py-4 text-xs uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-white transition-colors"
                  >
                    + Upload Your Product Image
                  </button>
                )}
              </section>
            )}

            {/* Color Selector */}
            {studioMode === "aimo" && (
              <section>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">02 · {t("custom.color")}</p>
                <div className="flex gap-3">
                  {(["black", "charcoal", "white"] as Color[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`h-10 w-10 border-2 rounded-full transition-all ${color === c ? "border-primary scale-110" : "border-border"}`}
                      style={{ backgroundColor: c === "black" ? "#0f0f0f" : c === "white" ? "#f5f5f5" : "#2d2d2d" }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Upload Custom Graphics */}
            <section>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                {studioMode === "aimo" ? "03" : "02"} · Upload Artwork / Logo (+{formatCurrency(15)})
              </p>
              <input ref={artworkRef} type="file" accept="image/*" hidden onChange={handleArtworkUpload} />
              {uploadedArtwork ? (
                <div className="flex items-center gap-3 bg-surface border border-border p-3">
                  <img src={uploadedArtwork} alt="preview" className="h-12 w-12 object-cover border border-border" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">Custom Graphic Attached</p>
                    <p className="text-[10px] text-primary">+{formatCurrency(15)}</p>
                  </div>
                  <button
                    onClick={() => setUploadedArtwork(null)}
                    className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => artworkRef.current?.click()}
                  className="w-full border border-dashed border-border p-4 hover:border-primary transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"
                >
                  <Upload className="h-4 w-4 text-primary" />
                  <span>Upload Design Image</span>
                </button>
              )}
            </section>

            {/* Add Custom Text */}
            <section>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                {studioMode === "aimo" ? "04" : "03"} · Add Custom Text (+{formatCurrency(8)})
              </p>
              <div className="flex items-center border border-border bg-surface px-3">
                <Type className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 40))}
                  placeholder="Type your text / statement..."
                  className="flex-1 bg-transparent py-3 px-2 outline-none text-sm"
                  maxLength={40}
                />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Text Color:</span>
                {(["white", "ember", "black"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setTextColor(c)}
                    className={`h-6 w-6 border-2 rounded-full ${textColor === c ? "border-primary scale-110" : "border-border"}`}
                    style={{ backgroundColor: c === "ember" ? "#e85d3a" : c === "white" ? "#fff" : "#000" }}
                  />
                ))}
              </div>
            </section>

            {/* Position Selector */}
            <section>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                {studioMode === "aimo" ? "05" : "04"} · Print Location
              </p>
              <div className="grid grid-cols-3 gap-2 border border-border bg-surface p-1 rounded-md">
                {(["front", "back", "sleeve"] as Position[]).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPosition(p)}
                    className={`py-2 text-[10px] uppercase tracking-widest font-bold rounded transition-all ${
                      position === p ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </section>

            {/* Size Selector */}
            {studioMode === "aimo" && (
              <section>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">06 · Garment Size</p>
                <div className="flex gap-2">
                  {(selectedProduct?.sizes || ["S", "M", "L", "XL"]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`min-w-10 h-10 border text-xs uppercase ${
                        size === s ? "bg-primary border-primary text-white" : "border-border hover:border-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Summary & Action Button */}
            <div className="pt-6 border-t border-border space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block">
                    {studioMode === "byop" ? "Flat Print Fee" : "Custom Apparel Total"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {studioMode === "byop" ? "Includes studio print service" : "Includes base garment + customization"}
                  </span>
                </div>
                <span className="text-3xl font-display text-primary italic">{formatCurrency(price)}</span>
              </div>

              <button
                onClick={handleAddToCartClick}
                className="w-full bg-primary text-white py-4 text-xs uppercase tracking-[0.3em] font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span>Add Custom Build to Cart</span>
              </button>
            </div>
          </div>
        </div>

        {/* AuthGate Modal for Guest Users */}
        <AuthGateModal
          isOpen={showAuthGate}
          onClose={() => setShowAuthGate(false)}
          actionName="add custom designs to your cart or place orders"
          onSuccess={() => {
            executeAddToCart();
          }}
        />
      </div>
    </AuthGate>
  );
}
