import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "../lib/i18n";
import { CartProvider } from "../lib/cart";
import { CurrencyProvider } from "../lib/currency";
import { ReviewsProvider } from "../lib/reviews";
import { Nav } from "../components/site/Nav";
import { Footer } from "../components/site/Footer";
import { LiveChat } from "../components/site/LiveChat";
import { SITE_URL, generateOrganizationSchema } from "../components/site/SEO";

const JSONLD = [generateOrganizationSchema()].map((schema) => JSON.stringify(schema));
const SITE_IMAGE = `${SITE_URL}/aw-icon.png`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl italic text-primary">404</h1>
        <h2 className="mt-4 text-xl font-medium tracking-wide uppercase">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold text-white hover:brightness-110">Go home</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl italic">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold text-white">Try again</button>
          <a href="/" className="border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "robots", content: "index,follow" },
      { title: "AimoWear — Premium Fashion & Custom Clothing" },
      {
        name: "description",
        content:
          "AimoWear is a premium fashion house blending ready-made editorial collections with a custom clothing studio — upload artwork, add text, choose print positions, and craft your silhouette.",
      },
      { name: "author", content: "AimoWear" },
      {
        name: "keywords",
        content:
          "fashion, streetwear, custom clothing, print on demand, tees, hoodies, AimoWear, premium apparel",
      },
      { name: "theme-color", content: "#0f0f0f" },
      { property: "og:title", content: "AimoWear — Premium Fashion & Custom Clothing" },
      {
        property: "og:description",
        content: "A premium fashion brand — curated collections and precision custom design.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: SITE_IMAGE },
      { property: "og:image:alt", content: "AimoWear logo" },
      { property: "og:site_name", content: "AimoWear" },
      { property: "og:locale", content: "en_US" },
      { property: "og:locale:alternate", content: "ar_AR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AimoWear — Premium Fashion & Custom Clothing" },
      {
        name: "twitter:description",
        content: "A premium fashion brand — curated collections and precision custom design.",
      },
      { name: "twitter:image", content: SITE_IMAGE },
      { name: "twitter:site", content: "@aimowear" },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/aw-icon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/aw-icon.png" },
      { rel: "alternate", hrefLang: "en", href: SITE_URL },
      { rel: "alternate", hrefLang: "ar", href: `${SITE_URL}/?lang=ar` },
      { rel: "alternate", hrefLang: "x-default", href: SITE_URL },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600;700&display=swap",
      },
    ],
    scripts: JSONLD.map((json) => ({
      type: "application/ld+json",
      children: json,
    })),
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <CurrencyProvider>
          <CartProvider>
            <ReviewsProvider>
              {isAdmin ? (
                <div className="min-h-screen bg-background text-foreground font-sans">
                  <Outlet />
                </div>
              ) : (
                <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
                  <Nav />
                  <main className="flex-1">
                    <Outlet />
                  </main>
                  <Footer />
                  <LiveChat />
                </div>
              )}
            </ReviewsProvider>
          </CartProvider>
        </CurrencyProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
