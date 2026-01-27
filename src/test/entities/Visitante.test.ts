import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ 
          data: [
            {
              id: "visitante-1",
              nome: "João Silva",
              documento: "123456789",
              data_entrada: "2024-01-15T10:00:00Z",
              unidades: {
                id: "unit-1",
                numero: "101",
                blocos: {
                  id: "bloco-1",
                  nome: "Bloco A",
                  condominio_id: "condo-1"
                }
              }
            }
          ], 
          error: null 
        })),
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ 
            data: {
              id: "visitante-1",
              nome: "João Silva",
              documento: "123456789",
            }, 
            error: null 
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: "new-visitante", nome: "Maria Silva" }, 
            error: null 
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: "visitante-1" }, 
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

import { Visitante } from "@/entities/Visitante";

describe("Visitante Entity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return list of visitantes with transformed data", async () => {
      const result = await Visitante.list();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("nome_visitante");
    });
  });

  describe("create", () => {
    it("should create visitante with correct field mapping", async () => {
      const result = await Visitante.create({
        nome: "Maria Silva",
        documento: "987654321",
        unidade_id: "unit-1",
        condominio_id: "condo-1",
        porteiro_id: "porteiro-1",
      });
      
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("nome_visitante");
    });

    it("should handle legacy field names", async () => {
      const result = await Visitante.create({
        nome_visitante: "Carlos Santos",
        documento_visitante: "111222333",
        unidade_id: "unit-1",
        condominio_id: "condo-1",
        porteiro_id: "porteiro-1",
      });
      
      expect(result).toHaveProperty("id");
    });
  });

  describe("transformVisitante", () => {
    it("should determine correct status based on data_saida", async () => {
      // The transform function is internal, but we can verify through list/get
      const result = await Visitante.list();
      
      // Visitor with data_entrada but no data_saida should be "entrou"
      expect(result[0].status).toBe("entrou");
    });
  });
});
