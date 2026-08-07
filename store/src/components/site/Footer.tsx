import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="w-full pt-20 pb-12 px-8 border-t border-border">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-2">
          <div className="font-display text-4xl italic mb-6">AimoWear</div>
          <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed uppercase tracking-tighter">
            A premium fashion house. Ready-made editorial collections and a couture-grade custom studio — designed and finished with intent, distributed globally from Amman.
          </p>
        </div>
        <div className="space-y-4">
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-white">{t("footer.nav")}</h5>
          <ul className="text-[10px] uppercase tracking-widest text-muted-foreground space-y-3">
            <li><Link to="/shop" className="hover:text-primary">Collections</Link></li>
            <li><Link to="/custom" className="hover:text-primary">Custom Studio</Link></li>
            <li><Link to="/account" className="hover:text-primary">Account</Link></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-white">{t("footer.social")}</h5>
          <ul className="text-[10px] uppercase tracking-widest text-muted-foreground space-y-3">
            <li><a href="#" className="hover:text-primary">Instagram</a></li>
            <li><a href="#" className="hover:text-primary">TikTok</a></li>
            <li><a href="mailto:ahmad.m.nassarr@gmail.com" className="hover:text-primary">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-border pt-8">
        <div className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase">{t("footer.rights")}</div>
        <div className="flex gap-8 text-[9px] text-muted-foreground tracking-[0.2em] uppercase">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Accessibility</a>
        </div>
      </div>
    </footer>
  );
}
