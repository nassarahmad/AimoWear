import { useEffect, useState } from "react";

export type NotifKind = "placed" | "shipped" | "delivered" | "return";

export interface NotifPrefs {
  placed: boolean;
  shipped: boolean;
  delivered: boolean;
  return: boolean;
  channelEmail: boolean;
  channelInApp: boolean;
}

const KEY = "aimo.notifprefs";

export const DEFAULT_PREFS: NotifPrefs = {
  placed: true,
  shipped: true,
  delivered: true,
  return: true,
  channelEmail: true,
  channelInApp: true,
};

export function loadPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_PREFS;
}

export function savePrefs(p: NotifPrefs) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
  window.dispatchEvent(new CustomEvent("aimo:prefs"));
}

export function shouldNotify(kind: NotifKind): boolean {
  const p = loadPrefs();
  if (!p.channelEmail && !p.channelInApp) return false;
  return p[kind];
}

export function useNotifPrefs(): [NotifPrefs, (p: NotifPrefs) => void] {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  useEffect(() => {
    setPrefs(loadPrefs());
    const h = () => setPrefs(loadPrefs());
    window.addEventListener("aimo:prefs", h);
    return () => window.removeEventListener("aimo:prefs", h);
  }, []);
  const update = (p: NotifPrefs) => { savePrefs(p); setPrefs(p); };
  return [prefs, update];
}
