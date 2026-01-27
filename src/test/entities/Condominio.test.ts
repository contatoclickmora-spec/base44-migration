import { describe, it, expect, vi } from "vitest";

// Mock do supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ 
          data: [
            {
              id: "condo-1",
              nome: "Condomínio Teste",
              endereco: "Rua Teste, 123",
              cidade: "São Paulo",
              estado: "SP",
              cep: "01234-567",
              ativo: true,
            }
          ], 
          error: null 
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: {
              id: "condo-1",
              nome: "Condomínio Teste",
            }, 
            error: null 
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: "new-condo" }, 
            error: null 
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: "condo-1" }, 
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

import { Condominio } from "@/entities/Condominio";

describe("Condominio Entity", () => {
  describe("list", () => {
    it("should return list of condominios", async () => {
      const result = await Condominio.list();
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("create", () => {
    it("should create condominio and return it", async () => {
      const result = await Condominio.create({
        nome: "Novo Condomínio",
        endereco: "Rua Nova, 456",
        cidade: "Rio de Janeiro",
        estado: "RJ",
        cep: "12345-678",
      });
      
      expect(result).toHaveProperty("id");
    });
  });
});
