import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
  writable: true,
});

// Mock de importação dinâmica
vi.mock("@/api/base44Client", () => ({
  base44: {
    entities: {
      TestEntity: {
        list: vi.fn(() => Promise.resolve([{ id: "1" }])),
        get: vi.fn(() => Promise.resolve({ id: "1" })),
      },
    },
    auth: {
      me: vi.fn(() => Promise.resolve({ id: "user-1", email: "test@test.com" })),
    },
  },
}));

import { 
  SessionCache,
  debounce,
  throttle,
  clearAllCaches 
} from "@/components/utils/apiCache";

describe("apiCache utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe("SessionCache", () => {
    it("should set item in sessionStorage", () => {
      SessionCache.set("test-key", { data: "test" }, 10);
      
      expect(mockSessionStorage.setItem).toHaveBeenCalled();
    });

    it("should return null for missing key", () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      
      const result = SessionCache.get("missing-key");
      
      expect(result).toBeNull();
    });

    it("should return cached value if not expired", () => {
      const cachedItem = {
        value: { test: "data" },
        expiry: Date.now() + 60000, // 1 min in future
      };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(cachedItem));
      
      const result = SessionCache.get("test-key");
      
      expect(result).toEqual({ test: "data" });
    });

    it("should return null and remove expired item", () => {
      const cachedItem = {
        value: { test: "data" },
        expiry: Date.now() - 1000, // 1 sec ago
      };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(cachedItem));
      
      const result = SessionCache.get("test-key");
      
      expect(result).toBeNull();
      expect(mockSessionStorage.removeItem).toHaveBeenCalled();
    });

    it("should remove item from sessionStorage", () => {
      SessionCache.remove("test-key");
      
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith("test-key");
    });

    it("should clear all sessionStorage", () => {
      SessionCache.clear();
      
      expect(mockSessionStorage.clear).toHaveBeenCalled();
    });
  });

  describe("debounce", () => {
    it("should delay function execution", async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(fn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(100);
      
      expect(fn).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });

  describe("throttle", () => {
    it("should limit function execution frequency", () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(fn).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(100);
      throttledFn();
      
      expect(fn).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });
  });

  describe("clearAllCaches", () => {
    it("should not throw when clearing all caches", () => {
      expect(() => clearAllCaches()).not.toThrow();
    });
  });
});
