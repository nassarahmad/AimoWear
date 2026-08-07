import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { PRODUCTS } from "./products";
import { formatCurrency } from "./currency";
import { shouldNotify, type NotifKind } from "./notifications";

export type PaymentMethod = "cod" | "bank";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
  custom?: {
    baseColor: string;
    position: "front" | "back" | "sleeve";
    text?: string;
    textColor?: string;
    imageDataUrl?: string;
  };
}

export type OrderStatus =
  | "placed"
  | "production"
  | "shipped"
  | "delivered"
  | "return_requested"
  | "returned";

export interface TrackingUpdate {
  at: number;
  label: string;
  location: string;
}

export interface ShippingTracking {
  carrier: string;
  number: string;
  url: string;
  eta: number; // timestamp
  updates: TrackingUpdate[];
}

export interface EmailNotification {
  id: string;
  orderId: string;
  to: string;
  subject: string;
  body: string;
  sentAt: number;
}

export interface Order {
  id: string;
  createdAt: number;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentNote?: string;
  address: {
    name: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    country: string;
    zip: string;
  };
  returnReason?: string;
  tracking?: ShippingTracking;
}

// Stock overrides (decremented on order) live in localStorage.
const STOCK_STORAGE = "aimo.stock";
type StockMap = Record<string, Record<string, number>>;

function loadStock(): StockMap {
  try {
    const raw = localStorage.getItem(STOCK_STORAGE);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}
function saveStock(m: StockMap) {
  try { localStorage.setItem(STOCK_STORAGE, JSON.stringify(m)); } catch {}
}
export function getEffectiveStock(productId: string, size: string): number {
  const overrides = loadStock();
  if (overrides[productId] && size in overrides[productId]) return overrides[productId][size];
  const p = PRODUCTS.find((x) => x.id === productId);
  return p?.stock[size] ?? 0;
}

interface CartCtx {
  items: CartItem[];
  add: (item: Omit<CartItem, "id">) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  orders: Order[];
  placeOrder: (address: Order["address"], paymentMethod: PaymentMethod) => Order;
  advanceOrder: (id: string) => void;
  requestReturn: (id: string, reason: string) => void;
  stockVersion: number;
  emails: EmailNotification[];
}

const Ctx = createContext<CartCtx | null>(null);

const STORAGE = "aimo.cart";
const ORDERS_STORAGE = "aimo.orders";
const EMAIL_STORAGE = "aimo.emails";

const CARRIERS = ["Aramex", "DHL Express", "FedEx", "SMSA"];
function generateTracking(order: Order): ShippingTracking {
  const carrier = CARRIERS[Math.floor(Math.random() * CARRIERS.length)];
  const number = "AW" + Math.random().toString(36).slice(2, 12).toUpperCase();
  const carrierSlug = carrier.split(" ")[0].toLowerCase();
  const url = `https://www.google.com/search?q=${carrierSlug}+track+${number}`;
  const now = Date.now();
  const eta = now + (2 + Math.floor(Math.random() * 3)) * 24 * 60 * 60 * 1000;
  return {
    carrier,
    number,
    url,
    eta,
    updates: [
      { at: now - 12 * 60 * 60 * 1000, label: "Order received at fulfillment studio", location: "Amman, Jordan" },
      { at: now - 4 * 60 * 60 * 1000, label: "Package prepared and sealed", location: "Amman, Jordan" },
      { at: now, label: `Handed to ${carrier} — in transit`, location: `${order.address.city || "Origin hub"}` },
    ],
  };
}

function composeEmail(kind: "placed" | "shipped" | "delivered" | "return", order: Order): { subject: string; body: string } {
  const name = order.address.name || "friend";
  if (kind === "placed") return {
    subject: `AimoWear — Order ${order.id} confirmed`,
    body: `Hi ${name},\n\nThank you for choosing AimoWear. Your order ${order.id} is confirmed for ${formatCurrency(order.total)}.\nWe'll notify you the moment it ships.\n\n— The AimoWear Studio`,
  };
  if (kind === "shipped") return {
    subject: `AimoWear — Order ${order.id} is on the way`,
    body: `Hi ${name},\n\nYour order ${order.id} has left our studio via ${order.tracking?.carrier}.\nTracking #: ${order.tracking?.number}\nTrack: ${order.tracking?.url}\nEstimated delivery: ${order.tracking ? new Date(order.tracking.eta).toDateString() : "soon"}.\n\n— AimoWear`,
  };
  if (kind === "delivered") return {
    subject: `AimoWear — Order ${order.id} delivered`,
    body: `Hi ${name},\n\nYour order ${order.id} has been delivered. We hope it lives up to your expectations.\nShare your look with #AimoWear.\n\n— AimoWear`,
  };
  return {
    subject: `AimoWear — Return request received for ${order.id}`,
    body: `Hi ${name},\n\nWe've received your return request for order ${order.id}. Our team will contact you within 48 hours to arrange pickup.\n\n— AimoWear Care`,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [stockVersion, setStockVersion] = useState(0);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE);
      if (s) setItems(JSON.parse(s));
      const o = localStorage.getItem(ORDERS_STORAGE);
      if (o) setOrders(JSON.parse(o));
      const e = localStorage.getItem(EMAIL_STORAGE);
      if (e) setEmails(JSON.parse(e));
    } catch {}
  }, []);

  useEffect(() => { try { localStorage.setItem(STORAGE, JSON.stringify(items)); } catch {} }, [items]);
  useEffect(() => { try { localStorage.setItem(ORDERS_STORAGE, JSON.stringify(orders)); } catch {} }, [orders]);
  useEffect(() => { try { localStorage.setItem(EMAIL_STORAGE, JSON.stringify(emails)); } catch {} }, [emails]);

  const sendEmail = (order: Order, kind: NotifKind) => {
    if (!shouldNotify(kind)) return;
    const { subject, body } = composeEmail(kind, order);
    const note: EmailNotification = {
      id: "MAIL-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      orderId: order.id,
      to: order.address.email,
      subject,
      body,
      sentAt: Date.now(),
    };
    setEmails((prev) => [note, ...prev]);
  };

  const add: CartCtx["add"] = (item) => {
    setItems((prev) => {
      const key = `${item.productId}-${item.size}-${item.custom ? "c" + Date.now() : "s"}`;
      if (!item.custom) {
        const existing = prev.find((p) => p.productId === item.productId && p.size === item.size && !p.custom);
        if (existing) return prev.map((p) => p.id === existing.id ? { ...p, quantity: p.quantity + item.quantity } : p);
      }
      return [...prev, { ...item, id: key }];
    });
  };

  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const updateQty = (id: string, qty: number) => setItems((p) => p.map((i) => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i));
  const clear = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((a, b) => a + b.price * b.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((a, b) => a + b.quantity, 0), [items]);

  const placeOrder: CartCtx["placeOrder"] = (address, paymentMethod) => {
    const shipping = subtotal > 150 ? 0 : 15;
    const order: Order = {
      id: "AW-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      createdAt: Date.now(),
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: "placed",
      paymentMethod,
      address,
    };
    const overrides = loadStock();
    for (const it of items) {
      const current = getEffectiveStock(it.productId, it.size);
      overrides[it.productId] = overrides[it.productId] || {};
      overrides[it.productId][it.size] = Math.max(0, current - it.quantity);
    }
    saveStock(overrides);
    setStockVersion((v) => v + 1);

    setOrders((p) => [order, ...p]);
    setItems([]);
    sendEmail(order, "placed");
    return order;
  };

  const advanceOrder = (id: string) => {
    const flow: OrderStatus[] = ["placed", "production", "shipped", "delivered"];
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      const i = flow.indexOf(o.status as (typeof flow)[number]);
      if (i < 0) return o;
      const nextStatus = flow[Math.min(i + 1, flow.length - 1)];
      let updated: Order = { ...o, status: nextStatus };
      if (nextStatus === "shipped" && !o.tracking) {
        updated = { ...updated, tracking: generateTracking(updated) };
        setTimeout(() => sendEmail(updated, "shipped"), 0);
      } else if (nextStatus === "delivered") {
        setTimeout(() => sendEmail(updated, "delivered"), 0);
      }
      return updated;
    }));
  };

  const requestReturn: CartCtx["requestReturn"] = (id, reason) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      const updated: Order = { ...o, status: "return_requested", returnReason: reason };
      setTimeout(() => sendEmail(updated, "return"), 0);
      return updated;
    }));
  };

  return (
    <Ctx.Provider value={{ items, add, remove, updateQty, clear, count, subtotal, orders, placeOrder, advanceOrder, requestReturn, stockVersion, emails }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}
