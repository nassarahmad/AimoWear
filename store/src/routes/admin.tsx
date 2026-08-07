import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { createCatalogProduct, deleteCatalogProduct, getCatalogProducts, PRODUCTS, totalStock, type Product, type Category } from "@/lib/products";
import { getEffectiveStock } from "@/lib/cart";
import { useEffect, useState } from "react";
import { logoutUser } from "@/lib/auth";
import { AuthGate } from "@/components/site/AuthGate";
import { Boxes, LogOut, Package, Plus, ShoppingCart, Trash2, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

function AdminRoute() {
  const navigate = useNavigate();

  return (
    <AuthGate
      allowedRoles={["admin"]}
      title="Admin access only"
      description="Sign in with an admin account to access studio administration, orders, and inventory controls."
    >
      <Admin onSignOut={() => {
        logoutUser();
        navigate({ to: "/" });
      }} />
    </AuthGate>
  );
}

function Admin({ onSignOut }: { onSignOut: () => void }) {
  const { orders, advanceOrder, stockVersion } = useCart();
  const { formatCurrency } = useCurrency();
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<"overview" | "products" | "orders" | "inventory" | "returns">("overview");
  const [catalog, setCatalog] = useState<Product[]>(() => getCatalogProducts());
  const [form, setForm] = useState({
    id: "",
    code: "",
    nameEn: "",
    nameAr: "",
    category: "tees" as Category,
    price: "",
    fabricEn: "",
    fabricAr: "",
    descriptionEn: "",
    descriptionAr: "",
    sizes: "S,M,L,XL",
    stock: "10,12,8,6",
  });

  useEffect(() => {
    setCatalog(getCatalogProducts());
  }, [stockVersion, tab]);

  const revenue = orders.reduce((a, b) => a + b.total, 0);
  const customerCount = new Set(orders.map((o) => o.address.email)).size;
  const returns = orders.filter((o) => o.status === "return_requested" || o.status === "returned");

  const stats = [
    { label: t("admin.revenue"), value: formatCurrency(revenue), icon: TrendingUp },
    { label: t("admin.orders"), value: orders.length, icon: ShoppingCart },
    { label: t("admin.customers"), value: customerCount, icon: Users },
    { label: t("admin.products"), value: catalog.length, icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">AimoWear</p>
            <h1 className="font-display text-2xl italic">Studio Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">← View store</a>
            <button onClick={onSignOut} className="inline-flex items-center gap-2 border border-border px-4 py-2 text-[10px] uppercase tracking-widest hover:border-primary hover:text-primary">
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="px-8 py-12 max-w-7xl mx-auto">
        <div className="flex gap-2 md:gap-4 border-b border-border mb-10 overflow-x-auto pb-1">
          {([
            ["overview", "Overview"],
            ["products", t("admin.products")],
            ["orders", t("admin.orders")],
            ["inventory", t("admin.inventory")],
            ["returns", t("admin.returns")],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 pb-4 text-xs uppercase tracking-[0.2em] font-bold border-b-2 whitespace-nowrap ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-white"}`}
            >{label}{k === "returns" && returns.length > 0 && ` (${returns.length})`}</button>
          ))}
        </div>

        {tab === "overview" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {stats.map((s) => (
                <div key={s.label} className="bg-surface border border-border p-6">
                  <s.icon className="h-4 w-4 text-primary mb-6" />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{s.label}</p>
                  <p className="font-display text-4xl italic">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-surface border border-border p-6">
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold mb-6">Recent Orders</h3>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-sm">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex justify-between items-center border-b border-border/50 pb-3">
                      <div>
                        <p className="text-sm">{o.id}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{o.address.name} · {o.items.length} items · {o.paymentMethod.toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary">{formatCurrency(o.total)}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{o.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "products" && (
          <div className="space-y-6">
            <div className="bg-surface border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-4 w-4 text-primary" />
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold">Add Product</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="Product ID" className="bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code" className="bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
                <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="English name" className="bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
                <input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} placeholder="Arabic name" className="bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className="bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary">
                  <option value="tees">Tees</option>
                  <option value="hoodies">Hoodies</option>
                  <option value="outer">Outer</option>
                  <option value="pants">Pants</option>
                  <option value="acc">Accessories</option>
                </select>
                <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
                <input value={form.fabricEn} onChange={(e) => setForm({ ...form, fabricEn: e.target.value })} placeholder="Fabric English" className="bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
                <input value={form.fabricAr} onChange={(e) => setForm({ ...form, fabricAr: e.target.value })} placeholder="Fabric Arabic" className="bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
                <input value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} placeholder="Description English" className="bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
                <input value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} placeholder="Description Arabic" className="bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
                <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="Sizes (S,M,L)" className="bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
                <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock (10,12,8)" className="bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
              </div>
              <button onClick={() => {
                const sizes = form.sizes.split(",").map((s) => s.trim()).filter(Boolean);
                const stockValues = form.stock.split(",").map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
                const stock = Object.fromEntries(sizes.map((size, index) => [size, stockValues[index] ?? 0]));
                const product: Product = {
                  id: form.id || `custom-${Date.now()}`,
                  code: form.code || "C.00",
                  name: { en: form.nameEn || "Custom product", ar: form.nameAr || "منتج مخصص" },
                  category: form.category,
                  price: Number(form.price) || 0,
                  image: "",
                  fabric: { en: form.fabricEn || "Custom fabric", ar: form.fabricAr || "قماش مخصص" },
                  description: { en: form.descriptionEn || "Added from admin", ar: form.descriptionAr || "أضيف من الإدارة" },
                  sizes,
                  stock,
                  rating: 4.5,
                  reviewCount: 0,
                };
                const created = createCatalogProduct(product);
                setCatalog([created, ...catalog]);
                setForm({ ...form, id: "", code: "", nameEn: "", nameAr: "", price: "", fabricEn: "", fabricAr: "", descriptionEn: "", descriptionAr: "", sizes: "S,M,L,XL", stock: "10,12,8,6" });
              }} className="mt-4 bg-primary text-white px-6 py-3 text-xs uppercase tracking-[0.3em] font-bold hover:brightness-110">Create Product</button>
            </div>

            <div className="bg-surface border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="text-left p-4">Code</th>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-right p-4">Price</th>
                    <th className="text-right p-4">Stock</th>
                    <th className="text-right p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="p-4 text-muted-foreground">{p.code}</td>
                      <td className="p-4">{p.name[lang]}</td>
                      <td className="p-4 text-muted-foreground uppercase text-[10px] tracking-widest">{p.category}</td>
                      <td className="p-4 text-right text-primary">{formatCurrency(p.price)}</td>
                      <td className="p-4 text-right">{p.sizes.reduce((a, s) => a + getEffectiveStock(p.id, s), 0)}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => {
                          deleteCatalogProduct(p.id);
                          setCatalog((prev) => prev.filter((item) => item.id !== p.id));
                        }} className="inline-flex items-center gap-2 text-primary hover:text-white">
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-muted-foreground py-12 text-center">No orders yet.</p>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="bg-surface border border-border p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <p className="font-display text-2xl italic">{o.id}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                        {new Date(o.createdAt).toLocaleString()} · {o.address.name} · {o.address.email}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Payment: {o.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary text-xl">{formatCurrency(o.total)}</p>
                      <p className="text-[10px] uppercase tracking-widest text-primary mt-1">{o.status}</p>
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    {o.items.map((i) => (
                      <p key={i.id} className="text-muted-foreground">· {i.name} — Size {i.size} × {i.quantity}</p>
                    ))}
                  </div>
                  {o.status !== "delivered" && o.status !== "return_requested" && o.status !== "returned" && (
                    <button
                      onClick={() => advanceOrder(o.id)}
                      className="mt-4 border border-primary text-primary px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-colors"
                    >Advance Status</button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "inventory" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" key={stockVersion}>
            {PRODUCTS.map((p) => {
              const total = p.sizes.reduce((a, s) => a + getEffectiveStock(p.id, s), 0);
              const originalTotal = totalStock(p);
              const low = total < 20;
              return (
                <div key={p.id} className="bg-surface border border-border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{p.code}</p>
                      <p className="font-medium">{p.name[lang]}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Original: {originalTotal}</p>
                    </div>
                    <div className={`flex items-center gap-2 ${low ? "text-primary" : "text-muted-foreground"}`}>
                      <Boxes className="h-4 w-4" />
                      <span className="font-display italic text-2xl">{total}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {p.sizes.map((s) => {
                      const n = getEffectiveStock(p.id, s);
                      return (
                        <div key={s} className="border border-border p-2 text-center">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s}</p>
                          <p className={n < 5 ? "text-primary" : ""}>{n}</p>
                        </div>
                      );
                    })}
                  </div>
                  {low && <p className="text-[10px] text-primary uppercase tracking-widest mt-3">⚠ Low stock — reorder</p>}
                </div>
              );
            })}
          </div>
        )}

        {tab === "returns" && (
          <div className="space-y-4">
            {returns.length === 0 ? (
              <p className="text-muted-foreground py-12 text-center">No return requests.</p>
            ) : (
              returns.map((o) => (
                <div key={o.id} className="bg-surface border border-border p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                    <div>
                      <p className="font-display text-2xl italic">{o.id}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{o.address.name} · {o.address.email}</p>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-primary">{o.status}</p>
                  </div>
                  <p className="text-sm"><span className="text-muted-foreground">Reason:</span> {o.returnReason}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}


