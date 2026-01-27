import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ 
          data: [
            {
              id: "unit-1",
              numero: "101",
              tipo: "apartamento",
              bloco_id: "bloco-1",
              blocos: {
                id: "bloco-1",
                nome: "Bloco A",
                condominio_id: "condo-1"
              }
            }
          ], 
          error: null 
        })),
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ 
            data: {
              id: "unit-1",
              numero: "101",
              blocos: { condominio_id: "condo-1" }
            }, 
            error: null 
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: "new-unit", numero: "102" }, 
            error: null 
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: "unit-1" }, 
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

import { Residencia } from "@/entities/Residencia";

describe("Residencia Entity (Unidades)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return list of unidades with condominio_id from bloco", async () => {
      const result = await Residencia.list();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("condominio_id");
    });
  });

  describe("get", () => {
    it("should return single unidade with condominio_id", async () => {
      const result = await Residencia.get("unit-1");
      
      expect(result).toHaveProperty("id", "unit-1");
      expect(result).toHaveProperty("condominio_id");
    });
  });

  describe("filter", () => {
    it("should filter by condominio_id", async () => {
      const result = await Residencia.filter({ condominio_id: "condo-1" });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("create", () => {
    it("should create new unidade", async () => {
      const result = await Residencia.create({
        numero: "102",
        bloco_id: "bloco-1",
        tipo: "apartamento",
      });
      
      expect(result).toHaveProperty("id");
    });
  });

  describe("delete", () => {
    it("should delete unidade and return true", async () => {
      const result = await Residencia.delete("unit-1");
      
      expect(result).toBe(true);
    });
  });
});
