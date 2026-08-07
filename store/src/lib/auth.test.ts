import { beforeEach, describe, expect, it } from "vitest";
import { registerUser, loginUser } from "./auth";

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
  Object.defineProperty(globalThis, "sessionStorage", {
    value: {
      getItem(key: string) { return storage[key] ?? null; },
      setItem(key: string, value: string) { storage[key] = value; },
      removeItem(key: string) { delete storage[key]; },
      clear() { Object.keys(storage).forEach((key) => delete storage[key]); },
    },
    configurable: true,
  });
});

describe("auth helpers", () => {
  it("registers and logs in a user", () => {
    const user = registerUser({ username: "demo", email: "demo@example.com", password: "Pass123!" });
    expect(user.username).toBe("demo");
    const loggedIn = loginUser({ username: "demo", password: "Pass123!" });
    expect(loggedIn?.username).toBe("demo");
  });
});
