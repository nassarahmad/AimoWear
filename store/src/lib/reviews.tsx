import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: number;
}

interface ReviewsCtx {
  reviews: Review[];
  add: (r: Omit<Review, "id" | "createdAt">) => void;
  forProduct: (productId: string) => Review[];
}

const Ctx = createContext<ReviewsCtx | null>(null);
const STORAGE = "aimo.reviews";

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setReviews(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE, JSON.stringify(reviews)); } catch {} }, [reviews]);

  const add: ReviewsCtx["add"] = (r) => {
    setReviews((prev) => [
      { ...r, id: Math.random().toString(36).slice(2, 10), createdAt: Date.now() },
      ...prev,
    ]);
  };
  const forProduct = (productId: string) => reviews.filter((r) => r.productId === productId);

  return <Ctx.Provider value={{ reviews, add, forProduct }}>{children}</Ctx.Provider>;
}

export function useReviews() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useReviews outside provider");
  return c;
}
