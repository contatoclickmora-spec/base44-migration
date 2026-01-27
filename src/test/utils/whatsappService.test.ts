import { describe, it, expect, vi } from "vitest";
import { substituirVariaveisTemplate } from "@/components/utils/whatsappService";

describe("WhatsApp Service", () => {
  describe("substituirVariaveisTemplate", () => {
    it("should replace single variable", () => {
      const template = "Olá {{nome}}, sua encomenda chegou!";
      const vars = { nome: "João" };
      
      const result = substituirVariaveisTemplate(template, vars);
      
      expect(result).toBe("Olá João, sua encomenda chegou!");
    });

    it("should replace multiple variables", () => {
      const template = "{{nome}}, código: {{codigo}}";
      const vars = { nome: "Maria", codigo: "ABC123" };
      
      const result = substituirVariaveisTemplate(template, vars);
      
      expect(result).toBe("Maria, código: ABC123");
    });

    it("should handle missing variables gracefully", () => {
      const template = "Olá {{nome}}, seu código é {{codigo}}";
      const vars = { nome: "Carlos" };
      
      const result = substituirVariaveisTemplate(template, vars);
      
      expect(result).toBe("Olá Carlos, seu código é ");
    });

    it("should return empty string for undefined template", () => {
      const result = substituirVariaveisTemplate(undefined, { nome: "Test" });
      
      expect(result).toBe("");
    });

    it("should return template unchanged if no vars provided", () => {
      const template = "Mensagem sem variáveis";
      
      const result = substituirVariaveisTemplate(template, null);
      
      expect(result).toBe(template);
    });
  });
});
