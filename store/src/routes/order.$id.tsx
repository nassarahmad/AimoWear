import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { Check, RotateCcw, Truck, Mail, MapPin, Package } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/order/$id")({
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const { orders, requestReturn } = useCart();
  const { formatCurrency } = useCurrency();
  const { t } = useI18n();
  const order = orders.find((o) => o.id === id);
  const [showReturn, setShowReturn] = useState(false);
  const [reason, setReason] = useState("");

  if (!order) {
    return (
      <div className="p-20 text-center">
        <h1 className="font-display text-4xl italic">Order not found</h1>
        <Link to="/account" className="text-primary underline mt-4 inline-block">Back to account</Link>
      </div>
    );
  }

  const steps = [
    { key: "placed", label: t("order.placed") },
    { key: "production", label: t("order.production") },
    { key: "shipped", label: t("order.shipped") },
    { key: "delivered", label: t("order.delivered") },
  ] as const;
  const currentIdx = steps.findIndex((s) => s.key === order.status);
  const isReturn = order.status === "return_requested" || order.status === "returned";
  const canReturn = order.status === "delivered";

  const submitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    requestReturn(order.id, reason.trim() || "No reason provided");
    setShowReturn(false);
  };

  const bank = { name: "AHMAD MAJED NASSAR NASSAR", bank: "Arab Islamic Bank", phone: "00962 78 989 4881" };

  return (
    <div className="px-8 py-16 max-w-4xl mx-auto min-h-[60vh] page-enter">
      <p className="text-[10px] uppercase tracking-[0.4em] text-primary mb-4 font-bold">{t("order.title")} · {order.id}</p>
      <h1 className="font-display text-4xl md:text-6xl italic mb-2">Thank you.</h1>
      <p className="text-muted-foreground mb-6">Confirmation sent to {order.address.email}</p>

      <div className="mb-12 flex items-start gap-3 border border-primary/40 bg-primary/5 p-4">
        <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="uppercase tracking-widest text-primary font-bold mb-1">Email notification sent</p>
          <p className="text-muted-foreground">
            A confirmation email has been dispatched to <span className="text-white">{order.address.email}</span>.
            You'll receive further updates when your order ships and is delivered.
          </p>
        </div>
      </div>


      {isReturn ? (
        <div className="bg-surface border border-primary p-8 mb-12">
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-3">
            {order.status === "return_requested" ? t("order.returnRequested") : t("order.returned")}
          </p>
          <p className="text-sm text-muted-foreground">Reason: {order.returnReason}</p>
          <p className="text-xs text-muted-foreground mt-4">Our team will reach out to arrange pickup and refund via {order.paymentMethod === "cod" ? "cash" : "bank transfer"}.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border p-8 mb-12">
          <p className="text-xs uppercase tracking-[0.3em] font-bold mb-8">{t("order.status")}</p>
          <div className="grid grid-cols-4 gap-2 relative">
            {steps.map((s, i) => {
              const done = i <= currentIdx;
              return (
                <div key={s.key} className="text-center relative">
                  <div className={`mx-auto size-10 rounded-full flex items-center justify-center border-2 transition-colors ${done ? "bg-primary border-primary text-white" : "border-border text-muted-foreground"}`}>
                    {done ? <Check className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
                  </div>
                  <p className={`mt-3 text-[10px] uppercase tracking-widest ${done ? "text-white" : "text-muted-foreground"}`}>{s.label}</p>
                  {i < steps.length - 1 && (
                    <div className={`absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-px ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {order.tracking && !isReturn && (
        <div className="bg-surface border border-primary/50 p-8 mb-12 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 opacity-5 pointer-events-none">
            <Truck className="h-40 w-40" />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-full bg-primary/10 border border-primary grid place-items-center">
              <Truck className="h-4 w-4 text-primary truck-move" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Live Shipping Tracker</p>
              <p className="text-sm">{order.tracking.carrier} · <span className="font-mono">{order.tracking.number}</span></p>
            </div>
            <a href={order.tracking.url} target="_blank" rel="noreferrer" className="ml-auto text-[10px] uppercase tracking-widest border border-border px-4 py-2 hover:bg-primary hover:border-primary hover:text-white transition-colors">
              Track live →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-8">
            <div className="border border-border p-3">
              <p className="uppercase tracking-widest text-muted-foreground mb-1 text-[10px]">Carrier</p>
              <p className="text-sm">{order.tracking.carrier}</p>
            </div>
            <div className="border border-border p-3">
              <p className="uppercase tracking-widest text-muted-foreground mb-1 text-[10px]">Tracking No.</p>
              <p className="text-sm font-mono">{order.tracking.number}</p>
            </div>
            <div className="border border-border p-3">
              <p className="uppercase tracking-widest text-muted-foreground mb-1 text-[10px]">Estimated Delivery</p>
              <p className="text-sm text-primary">{new Date(order.tracking.eta).toDateString()}</p>
            </div>
          </div>

          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            {order.tracking.updates.slice().reverse().map((u, i) => (
              <div key={i} className="relative pb-5 last:pb-0">
                <div className={`absolute -left-[18px] top-1 size-3 rounded-full ${i === 0 ? "bg-primary pulse-ring" : "bg-border"}`} />
                <p className="text-sm">{u.label}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> {u.location} · {new Date(u.at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!order.tracking && !isReturn && order.status !== "delivered" && (
        <div className="bg-surface border border-border p-6 mb-12 flex items-center gap-4">
          <Package className="h-5 w-5 text-primary float-soft" />
          <div className="text-xs">
            <p className="uppercase tracking-widest font-bold mb-1">Preparing your shipment</p>
            <p className="text-muted-foreground">A tracking number will appear here the moment your order leaves our studio.</p>
          </div>
        </div>
      )}


      {order.paymentMethod === "bank" && !isReturn && (
        <div className="bg-surface border border-border p-6 mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-3">Bank Transfer Details</p>
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Account holder: </span><span className="font-mono">{bank.name}</span></p>
            <p><span className="text-muted-foreground">Bank: </span>{bank.bank}</p>
            <p><span className="text-muted-foreground">Reference / phone: </span><span className="font-mono">{bank.phone}</span></p>
            <p className="text-xs text-muted-foreground mt-3">Please send your transfer receipt via live chat once completed.</p>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-8">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 border-b border-border pb-4">
            <div className="w-16 h-20 bg-surface shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm">{item.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Size {item.size} · Qty {item.quantity}</p>
            </div>
            <p className="text-primary">{formatCurrency(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between border-t border-border pt-6 text-lg">
        <span>{t("cart.total")}</span>
        <span className="text-primary text-2xl">{formatCurrency(order.total)}</span>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Shipping to</p>
          <p>{order.address.name}</p>
          <p className="text-muted-foreground">{order.address.street}, {order.address.city}, {order.address.country} {order.address.zip}</p>
          {order.address.phone && <p className="text-muted-foreground">{order.address.phone}</p>}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Payment</p>
          <p className="uppercase">{order.paymentMethod === "cod" ? t("checkout.cod") : t("checkout.bank")}</p>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link to="/shop" className="inline-block border border-border px-8 py-4 text-xs uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-background">
          {t("cart.continue")}
        </Link>
        {canReturn && (
          <button onClick={() => setShowReturn(true)} className="inline-flex items-center gap-2 border border-primary text-primary px-8 py-4 text-xs uppercase tracking-[0.3em] font-bold hover:bg-primary hover:text-white">
            <RotateCcw className="h-3.5 w-3.5" />
            {t("order.requestReturn")}
          </button>
        )}
      </div>

      {showReturn && (
        <div className="fixed inset-0 z-50 bg-background/80 grid place-items-center p-6" onClick={() => setShowReturn(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submitReturn} className="w-full max-w-md bg-background border border-border p-8">
            <h3 className="font-display text-2xl italic mb-2">{t("order.requestReturn")}</h3>
            <p className="text-xs text-muted-foreground mb-6">Tell us why you'd like to return this order. Our team will arrange pickup within 48 hours.</p>
            <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder="Reason for return…" className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary resize-none" />
            <div className="mt-6 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowReturn(false)} className="text-xs uppercase tracking-widest text-muted-foreground">Cancel</button>
              <button type="submit" className="bg-primary text-white px-6 py-3 text-xs uppercase tracking-[0.3em] font-bold">Submit</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
