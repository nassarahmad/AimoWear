import { beforeEach, describe, expect, it } from "vitest";
import { createCatalogProduct, deleteCatalogProduct, getCatalogProducts } from "./products";

const storage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(storage).forEach((key) => delete storage[key]);
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem(key: string) { return storage[key] ?? null; },
      setItem(key: string, value: string) { storage[key] = value; },
      removeItem(key: string) { delete storage[key]; },
      clear() { Object.keys(storage).forEach((key) => delete storage[key]); },
    },
    configurable: true,
  });
});

describe("catalog helpers", () => {
  it("adds and removes a product from the catalog", () => {
    const created = createCatalogProduct({
      id: "test-product",
      code: "T.99",
      name: { en: "Test Product", ar: "منتج تجريبي" },
      category: "tees",
      price: 45,
      image: "",
      fabric: { en: "Cotton", ar: "قطن" },
      description: { en: "Test", ar: "اختبار" },
      sizes: ["S", "M"],
      stock: { S: 5, M: 2 },
      rating: 4.5,
      reviewCount: 3,
    });

    expect(created.id).toBe("test-product");
    expect(getCatalogProducts().some((p) => p.id === "test-product")).toBe(true);

    const next = deleteCatalogProduct("test-product");
    expect(next.some((p) => p.id === "test-product")).toBe(false);
  });
});
