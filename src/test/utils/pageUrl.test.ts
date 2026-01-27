import { describe, it, expect } from "vitest";
import { createPageUrl } from "@/utils/index";

describe("createPageUrl", () => {
  it("should create URL from page name", () => {
    expect(createPageUrl("Dashboard")).toBe("/Dashboard");
  });

  it("should replace spaces with hyphens", () => {
    expect(createPageUrl("Minha Pagina")).toBe("/Minha-Pagina");
  });

  it("should handle multiple spaces", () => {
    expect(createPageUrl("Nova Pagina Teste")).toBe("/Nova-Pagina-Teste");
  });

  it("should handle empty string", () => {
    expect(createPageUrl("")).toBe("/");
  });
});
