import { type ReactNode, createContext, useContext, useEffect, useMemo, useState, createElement } from "react";

export type CurrencyInfo = {
  code: string;
  locale: string;
  rate: number;
};

const DEFAULT_CURRENCY: CurrencyInfo = { code: "USD", locale: "en-US", rate: 1 };

const REGION_CURRENCY_MAP: Record<string, CurrencyInfo> = {
  US: { code: "USD", locale: "en-US", rate: 1 },
  CA: { code: "CAD", locale: "en-CA", rate: 1.35 },
  GB: { code: "GBP", locale: "en-GB", rate: 0.81 },
  IE: { code: "EUR", locale: "en-IE", rate: 0.92 },
  FR: { code: "EUR", locale: "fr-FR", rate: 0.92 },
  DE: { code: "EUR", locale: "de-DE", rate: 0.92 },
  ES: { code: "EUR", locale: "es-ES", rate: 0.92 },
  IT: { code: "EUR", locale: "it-IT", rate: 0.92 },
  NL: { code: "EUR", locale: "nl-NL", rate: 0.92 },
  SE: { code: "SEK", locale: "sv-SE", rate: 10.3 },
  NO: { code: "NOK", locale: "nb-NO", rate: 11.1 },
  DK: { code: "DKK", locale: "da-DK", rate: 6.8 },
  CH: { code: "CHF", locale: "de-CH", rate: 0.92 },
  AU: { code: "AUD", locale: "en-AU", rate: 1.5 },
  NZ: { code: "NZD", locale: "en-NZ", rate: 1.65 },
  JP: { code: "JPY", locale: "ja-JP", rate: 148 },
  CN: { code: "CNY", locale: "zh-CN", rate: 7.25 },
  IN: { code: "INR", locale: "hi-IN", rate: 83 },
  AE: { code: "AED", locale: "ar-AE", rate: 3.67 },
  SA: { code: "SAR", locale: "ar-SA", rate: 3.75 },
  JO: { code: "JOD", locale: "ar-JO", rate: 0.71 },
  KW: { code: "KWD", locale: "ar-KW", rate: 0.31 },
  QA: { code: "QAR", locale: "ar-QA", rate: 3.65 },
  EG: { code: "EGP", locale: "ar-EG", rate: 31 },
  TR: { code: "TRY", locale: "tr-TR", rate: 34 },
  BR: { code: "BRL", locale: "pt-BR", rate: 5.1 },
  MX: { code: "MXN", locale: "es-MX", rate: 17.1 },
  AR: { code: "ARS", locale: "es-AR", rate: 350 },
  RU: { code: "RUB", locale: "ru-RU", rate: 98 },
};

const LANGUAGE_CURRENCY_MAP: Record<string, CurrencyInfo> = {
  en: { code: "USD", locale: "en-US", rate: 1 },
  ar: { code: "USD", locale: "en-US", rate: 1 },
  fr: { code: "EUR", locale: "fr-FR", rate: 0.92 },
  de: { code: "EUR", locale: "de-DE", rate: 0.92 },
  es: { code: "EUR", locale: "es-ES", rate: 0.92 },
  pt: { code: "EUR", locale: "pt-PT", rate: 0.92 },
  ja: { code: "JPY", locale: "ja-JP", rate: 148 },
  zh: { code: "CNY", locale: "zh-CN", rate: 7.25 },
};

export function getCurrencyFromLocale(locale?: string): CurrencyInfo {
  const effectiveLocale = (locale || (typeof navigator !== "undefined" ? navigator.language : "en-US") || "en-US").replace("_", "-").toLowerCase();
  const parts = effectiveLocale.split("-");
  const region = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
  const language = parts[0];

  return REGION_CURRENCY_MAP[region] ?? LANGUAGE_CURRENCY_MAP[language] ?? DEFAULT_CURRENCY;
}

export function formatCurrency(amountUsd: number, locale?: string): string {
  const currency = getCurrencyFromLocale(locale);
  const convertedAmount = amountUsd * currency.rate;
  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
}

export function convertUsdToLocal(amountUsd: number, locale?: string): number {
  return amountUsd * getCurrencyFromLocale(locale).rate;
}

interface CurrencyContextValue {
  currency: CurrencyInfo;
  formatCurrency: (amountUsd: number) => string;
  convertUsdToLocal: (amountUsd: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyInfo>(DEFAULT_CURRENCY);

  useEffect(() => {
    setCurrency(getCurrencyFromLocale());
  }, []);

  const value = useMemo(
    () => ({
      currency,
      formatCurrency: (amountUsd: number) => {
        const convertedAmount = amountUsd * currency.rate;
        return new Intl.NumberFormat(currency.locale, {
          style: "currency",
          currency: currency.code,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(convertedAmount);
      },
      convertUsdToLocal: (amountUsd: number) => amountUsd * currency.rate,
    }),
    [currency],
  );

  return createElement(CurrencyContext.Provider, { value }, children);
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
