import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCart, type PaymentMethod } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { AuthGate } from "@/components/site/AuthGate";
import { useState } from "react";
import { Banknote, Truck, Info } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

const BANK = {
  name: "AHMAD MAJED NASSAR NASSAR",
  bank: "Arab Islamic Bank (البنك العربي الإسلامي)",
  phone: "00962 78 989 4881",
};

function Checkout() {
  const { items, subtotal, placeOrder } = useCart();
  const { formatCurrency } = useCurrency();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", phone: "", street: "", city: "", country: "Jordan", zip: "" });
  const [pm, setPm] = useState<PaymentMethod>("cod");
  const shipping = subtotal > 150 ? 0 : 15;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const order = placeOrder({ ...f }, pm);
    navigate({ to: "/order/$id", params: { id: order.id } });
  };

  const input = "w-full bg-transparent border border-border px-4 py-4 text-sm outline-none focus:border-primary transition-colors";
  const label = "text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block";

  return (
    <AuthGate>
      {items.length === 0 ? (
        <div className="p-20 text-center">
          <p className="text-muted-foreground mb-6">{t("cart.empty")}</p>
          <Link to="/shop" className="text-primary underline">{t("cart.continue")}</Link>
        </div>
      ) : (
        <div className="px-8 py-16 max-w-6xl mx-auto">
          <h1 className="font-display text-5xl md:text-6xl italic mb-12">{t("checkout.title")}</h1>

          <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
            <div className="space-y-10">
              <section>
                <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-6">01 · {t("checkout.contact")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>{t("checkout.name")}</label>
                    <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={input} />
                  </div>
                  <div>
                    <label className={label}>{t("checkout.email")}</label>
                    <input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={input} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={label}>{t("checkout.phone")}</label>
                    <input required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+962 ..." className={input} />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-6">02 · {t("checkout.shipping")}</h2>
                <div className="space-y-4">
                  <div>
                    <label className={label}>{t("checkout.address")}</label>
                    <input required value={f.street} onChange={(e) => setF({ ...f, street: e.target.value })} className={input} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={label}>{t("checkout.city")}</label>
                      <input required value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} className={input} />
                    </div>
                    <div>
                      <label className={label}>{t("checkout.country")}</label>
                      <input required value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} className={input} />
                    </div>
                    <div>
                      <label className={label}>{t("checkout.zip")}</label>
                      <input required value={f.zip} onChange={(e) => setF({ ...f, zip: e.target.value })} className={input} />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-6">03 · {t("checkout.payment")}</h2>

                <div className="mb-4 flex items-start gap-2 text-[11px] text-muted-foreground border border-border/70 bg-surface p-3">
                  <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <p>Stripe card payments are not currently available for Jordan-based merchants. Please choose one of the local options below.</p>
                </div>

                <div className="space-y-3">
                  <label className={`flex items-start gap-4 border p-4 cursor-pointer transition-colors ${pm === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-white"}`}>
                    <input type="radio" name="pm" value="cod" checked={pm === "cod"} onChange={() => setPm("cod")} className="mt-1 accent-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{t("checkout.cod")}</span></div>
                      <p className="text-[11px] text-muted-foreground mt-1">Pay in cash to the courier when your order arrives.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 border p-4 cursor-pointer transition-colors ${pm === "bank" ? "border-primary bg-primary/5" : "border-border hover:border-white"}`}>
                    <input type="radio" name="pm" value="bank" checked={pm === "bank"} onChange={() => setPm("bank")} className="mt-1 accent-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2"><Banknote className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{t("checkout.bank")}</span></div>
                      <p className="text-[11px] text-muted-foreground mt-1">Transfer to the account below and send the receipt via WhatsApp / live chat.</p>
                      {pm === "bank" && (
                        <div className="mt-4 border-t border-border pt-4 space-y-2 text-xs">
                          <div className="flex justify-between gap-4"><span className="text-muted-foreground uppercase tracking-widest text-[10px]">Bank</span><span>{BANK.bank}</span></div>
                          <div className="flex justify-between gap-4"><span className="text-muted-foreground uppercase tracking-widest text-[10px]">Account Holder</span><span className="font-mono">{BANK.name}</span></div>
                          <div className="flex justify-between gap-4"><span className="text-muted-foreground uppercase tracking-widest text-[10px]">Phone / Ref</span><span className="font-mono">{BANK.phone}</span></div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </section>
            </div>

            <aside className="bg-surface p-8 border border-border h-fit sticky top-24">
              <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-6">Summary</h2>
              <div className="space-y-3 mb-6">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate pr-2">{i.name} · {i.size} × {i.quantity}</span>
                    <span>{formatCurrency(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-border pt-4">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.subtotal")}</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.shipping")}</span><span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span></div>
                <div className="flex justify-between pt-3 border-t border-border"><span>{t("cart.total")}</span><span className="text-primary text-xl">{formatCurrency(subtotal + shipping)}</span></div>
              </div>
              <button type="submit" className="mt-8 w-full bg-primary text-white py-5 text-xs uppercase tracking-[0.3em] font-bold hover:brightness-110">
                {t("checkout.place")}
              </button>
            </aside>
          </form>
        </div>
      )}
    </AuthGate>
  );
}
