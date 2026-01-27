import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: "new-bloco", nome: "Bloco B" }, 
            error: null 
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: "bloco-1" }, 
              error: null 
            })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

import { Bloco } from "@/entities/Bloco";

describe("Bloco Entity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return empty array when no blocos", async () => {
      const result = await Bloco.list();
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("filter", () => {
    it("should handle empty filters", async () => {
      const result = await Bloco.filter({});
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle condominio_id filter", async () => {
      const result = await Bloco.filter({ condominio_id: "condo-1" });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("create", () => {
    it("should create bloco and return it", async () => {
      const result = await Bloco.create({
        nome: "Bloco B",
        condominio_id: "condo-1",
      });
      
      expect(result).toHaveProperty("id");
      expect(result.nome).toBe("Bloco B");
    });
  });

  describe("delete", () => {
    it("should delete bloco and return true", async () => {
      const result = await Bloco.delete("bloco-1");
      
      expect(result).toBe(true);
    });
  });
});
