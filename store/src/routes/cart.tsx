import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { AuthGate } from "@/components/site/AuthGate";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, remove, updateQty, subtotal, count } = useCart();
  const { t } = useI18n();
  const { formatCurrency } = useCurrency();
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;

  return (
    <AuthGate>
      <div className="px-8 py-16 max-w-6xl mx-auto min-h-[60vh]">
        <h1 className="font-display text-5xl md:text-6xl italic mb-2">{t("cart.title")}</h1>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-12">{count} item{count === 1 ? "" : "s"}</p>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground mb-6">{t("cart.empty")}</p>
            <Link to="/shop" className="inline-block bg-primary text-white px-8 py-4 text-xs uppercase tracking-[0.2em] font-bold">{t("cart.continue")}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 md:gap-6 border-b border-border pb-6">
                  <div className="w-24 md:w-32 aspect-[3/4] bg-surface shrink-0 relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    {item.custom?.imageDataUrl && (
                      <img src={item.custom.imageDataUrl} alt="art" className="absolute top-1/3 left-1/2 -translate-x-1/2 max-w-[40%]" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                      {t("product.size")}: {item.size}
                      {item.custom && ` · ${item.custom.position}`}
                      {item.custom?.text && ` · "${item.custom.text}"`}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="inline-flex items-center border border-border">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-3 py-2 hover:bg-surface"><Minus className="h-3 w-3" /></button>
                        <span className="px-4 text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-3 py-2 hover:bg-surface"><Plus className="h-3 w-3" /></button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-primary">{formatCurrency(item.price * item.quantity)}</span>
                        <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-primary" aria-label="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-surface p-8 h-fit border border-border">
              <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-6">Summary</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.subtotal")}</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.shipping")}</span><span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span></div>
                <div className="flex justify-between pt-4 border-t border-border text-base"><span>{t("cart.total")}</span><span className="text-primary text-xl">{formatCurrency(subtotal + shipping)}</span></div>
              </div>
              <Link to="/checkout" className="mt-8 block text-center bg-primary text-white py-5 text-xs uppercase tracking-[0.3em] font-bold hover:brightness-110">
                {t("cart.checkout")}
              </Link>
              <Link to="/shop" className="mt-3 block text-center text-xs uppercase tracking-widest text-muted-foreground hover:text-white">
                {t("cart.continue")}
              </Link>
            </aside>
          </div>
        )}
      </div>
    </AuthGate>
  );
}
