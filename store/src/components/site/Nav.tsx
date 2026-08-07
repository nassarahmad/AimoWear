import { Link, useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { getSessionUser } from "@/lib/auth";
import { ShoppingBag, User, Menu, X, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";

export function Nav() {
  const { lang, setLang, t } = useI18n();
  const { count } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(() => getSessionUser());

  useEffect(() => {
    setUser(getSessionUser());
  }, [pathname]);

  const linkClass = (p: string) =>
    `hover:text-primary transition-colors ${pathname.startsWith(p) && p !== "/" ? "text-primary font-bold" : ""}`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display text-3xl tracking-tight">AimoWear</Link>
          <div className="hidden md:flex gap-6 text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            <Link to="/shop" className={linkClass("/shop")}>{t("nav.shop")}</Link>
            <Link to="/custom" className={linkClass("/custom")}>{t("nav.custom")}</Link>
            <Link to="/shop" search={{ c: "outer" } as never} className={linkClass("/lookbook")}>{t("nav.lookbook")}</Link>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex border border-border rounded-full p-1">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-0.5 text-[10px] font-bold rounded-full transition-colors ${lang === "en" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
            >EN</button>
            <button
              onClick={() => setLang("ar")}
              className={`px-3 py-0.5 text-[10px] font-bold rounded-full transition-colors ${lang === "ar" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
            >AR</button>
          </div>

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="hidden md:inline-flex items-center gap-1.5 bg-primary/10 border border-primary/40 text-primary px-3 py-1 text-[10px] uppercase tracking-widest font-bold hover:bg-primary hover:text-white transition-colors"
            >
              <ShieldAlert className="h-3 w-3" />
              <span>Admin</span>
            </Link>
          )}

          <Link to="/account" className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-widest hover:text-primary">
            <User className="h-4 w-4" />
            <span className="hidden lg:inline">
              {user ? user.username : t("nav.account")}
            </span>
          </Link>

          <Link to="/cart" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest hover:text-primary">
            <ShoppingBag className="h-4 w-4" />
            <span>({count})</span>
          </Link>

          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 px-6 py-4 flex flex-col gap-4 text-xs uppercase tracking-[0.2em] font-medium bg-background">
          <Link to="/shop" onClick={() => setOpen(false)}>{t("nav.shop")}</Link>
          <Link to="/custom" onClick={() => setOpen(false)}>{t("nav.custom")}</Link>
          <Link to="/account" onClick={() => setOpen(false)}>{t("nav.account")}</Link>
          {user?.role === "admin" && (
            <Link to="/admin" onClick={() => setOpen(false)} className="text-primary font-bold">Admin Dashboard</Link>
          )}
        </div>
      )}
    </nav>
  );
}
