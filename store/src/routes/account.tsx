import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { useNotifPrefs, type NotifPrefs } from "@/lib/notifications";
import { useEffect, useMemo, useState } from "react";
import { getSessionUser, loginUser, logoutUser, registerUser } from "@/lib/auth";

export const Route = createFileRoute("/account")({
  component: Account,
});

function Account() {
  const { orders } = useCart();
  const { formatCurrency } = useCurrency();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useNotifPrefs();
  const [tab, setTab] = useState<"orders" | "designs" | "notifications" | "profile">("orders");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sessionUser, setSessionUser] = useState(() => getSessionUser());

  useEffect(() => {
    setSessionUser(getSessionUser());
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      if (mode === "register") {
        registerUser({ username, email, password });
        const loggedIn = loginUser({ username, password });
        setSessionUser(loggedIn);
        if (loggedIn?.role === "admin") {
          navigate({ to: "/admin" });
        }
      } else {
        const loggedIn = loginUser({ username, password });
        setSessionUser(loggedIn);
        if (loggedIn?.role === "admin") {
          navigate({ to: "/admin" });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue.");
    }
  };

  const handleLogout = () => {
    logoutUser();
    setSessionUser(null);
  };

  const userLabel = useMemo(() => sessionUser ? (sessionUser.role === "admin" ? "Admin" : "Member") : "Guest", [sessionUser]);

  if (!sessionUser) {
    return (
      <div className="px-8 py-16 max-w-2xl mx-auto min-h-[60vh]">
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary mb-4 font-bold">Access · 2026</p>
          <h1 className="font-display text-5xl md:text-6xl italic">Your Studio Account</h1>
          <p className="text-sm text-muted-foreground mt-4">Sign in to manage orders, designs, and account preferences. Use your account to access checkout, order history, and the custom studio.</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => { setMode("login"); setError(""); }} className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold border ${mode === "login" ? "bg-primary border-primary text-white" : "border-border text-muted-foreground"}`}>Login</button>
          <button onClick={() => { setMode("register"); setError(""); }} className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold border ${mode === "register" ? "bg-primary border-primary text-white" : "border-border text-muted-foreground"}`}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border p-6 space-y-4">
          <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
          {mode === "register" && (
            <input required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
          )}
          <input required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
          {error && <p className="text-sm text-primary">{error}</p>}
          <button type="submit" className="w-full bg-primary text-white px-6 py-4 text-xs uppercase tracking-[0.3em] font-bold hover:brightness-110">{mode === "register" ? "Create account" : "Sign in"}</button>
        </form>
      </div>
    );
  }

  const toggle = (k: keyof NotifPrefs) => setPrefs({ ...prefs, [k]: !prefs[k] });

  const customDesigns = orders.flatMap((o) => o.items.filter((i) => i.custom));

  return (
    <div className="px-8 py-16 max-w-6xl mx-auto min-h-[60vh]">
      <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary mb-4 font-bold">{userLabel} · 2026</p>
          <h1 className="font-display text-5xl md:text-6xl italic">{t("account.title")}</h1>
        </div>
        <button onClick={handleLogout} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">Sign out</button>
      </div>

      <div className="flex gap-6 border-b border-border mb-10 overflow-x-auto">
        {([
          ["orders", t("account.orders")],
          ["designs", t("account.designs")],
          ["notifications", "Notifications"],
          ["profile", t("account.profile")],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`pb-4 text-xs uppercase tracking-[0.2em] font-bold border-b-2 transition-colors whitespace-nowrap ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-white"}`}
          >{label}</button>
        ))}
      </div>

      {tab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <Link to="/order/$id" params={{ id: o.id }} key={o.id} className="block bg-surface p-6 border border-border hover:border-primary transition-colors">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <p className="font-display text-2xl italic">{o.id}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                        {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary text-xl">{formatCurrency(o.total)}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{o.status}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "designs" && (
        <div>
          {customDesigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">No custom designs yet.</p>
              <Link to="/custom" className="inline-block bg-primary text-white px-8 py-4 text-xs uppercase tracking-[0.2em] font-bold">Enter Studio</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {customDesigns.map((d) => (
                <div key={d.id} className="aspect-[3/4] bg-surface border border-border p-4 flex flex-col">
                  <div className="flex-1 relative">
                    <img src={d.image} alt="custom" className="w-full h-full object-contain" />
                    {d.custom?.imageDataUrl && <img src={d.custom.imageDataUrl} alt="art" className="absolute top-1/3 left-1/2 -translate-x-1/2 max-w-[40%]" />}
                  </div>
                  <p className="text-[10px] uppercase tracking-widest mt-2">{d.name}</p>
                  <p className="text-[9px] text-muted-foreground">{d.custom?.position} · {d.size}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "notifications" && (
        <div className="max-w-xl space-y-8 fade-in">
          <div>
            <h2 className="font-display text-2xl italic mb-2">Notification preferences</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Choose which order updates AimoWear sends you.</p>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Channels</p>
            {([
              ["channelEmail", "Email", "Order updates by email"],
              ["channelInApp", "In-app inbox", "Studio inbox on your account"],
            ] as const).map(([k, label, desc]) => (
              <label key={k} className="flex items-start justify-between gap-4 bg-surface border border-border p-4 cursor-pointer hover:border-primary/60 transition-colors">
                <div>
                  <p className="text-sm">{label}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{desc}</p>
                </div>
                <input type="checkbox" checked={prefs[k]} onChange={() => toggle(k)} className="accent-primary h-5 w-5 mt-1" />
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Order events</p>
            {([
              ["placed", "Order confirmed", "When your order is placed"],
              ["shipped", "Shipping updates", "Carrier, tracking, ETA"],
              ["delivered", "Delivered", "Delivery confirmation"],
              ["return", "Returns", "Return requests and status"],
            ] as const).map(([k, label, desc]) => (
              <label key={k} className="flex items-start justify-between gap-4 bg-surface border border-border p-4 cursor-pointer hover:border-primary/60 transition-colors">
                <div>
                  <p className="text-sm">{label}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{desc}</p>
                </div>
                <input type="checkbox" checked={prefs[k]} onChange={() => toggle(k)} className="accent-primary h-5 w-5 mt-1" />
              </label>
            ))}
          </div>

          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Preferences saved automatically.</p>
        </div>
      )}

      {tab === "profile" && (
        <div className="max-w-md space-y-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Name</p>
            <p className="font-display text-2xl italic">{sessionUser?.username ?? "Aimo Member"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Email</p>
            <p>{sessionUser?.email ?? "member@aimowear.com"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Tier</p>
            <p className="text-primary">{sessionUser?.role === "admin" ? "Admin Access" : "Studio Access"}</p>
          </div>
          <button onClick={handleLogout} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">{t("account.signout")}</button>
        </div>
      )}
    </div>
  );
}
