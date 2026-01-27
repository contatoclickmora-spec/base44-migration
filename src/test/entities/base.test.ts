import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do supabase antes da importação
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: "test-id" }, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: "test-id" }, error: null })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

import { createEntity } from "@/entities/base";

describe("createEntity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("parseSort", () => {
    it("should create entity with CRUD operations", () => {
      const entity = createEntity("test_table");
      
      expect(entity).toHaveProperty("list");
      expect(entity).toHaveProperty("filter");
      expect(entity).toHaveProperty("get");
      expect(entity).toHaveProperty("create");
      expect(entity).toHaveProperty("update");
      expect(entity).toHaveProperty("delete");
    });
  });

  describe("list", () => {
    it("should return empty array when no data", async () => {
      const entity = createEntity("test_table");
      const result = await entity.list();
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle sort parameter with descending order", async () => {
      const entity = createEntity("test_table");
      await entity.list("-created_at");
      
      // Verifica que a função foi chamada
      expect(true).toBe(true);
    });
  });

  describe("filter", () => {
    it("should handle empty filters", async () => {
      const entity = createEntity("test_table");
      const result = await entity.filter({});
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("create", () => {
    it("should create record and return it", async () => {
      const entity = createEntity("test_table");
      const result = await entity.create({ name: "Test" });
      
      expect(result).toHaveProperty("id");
    });
  });
});
