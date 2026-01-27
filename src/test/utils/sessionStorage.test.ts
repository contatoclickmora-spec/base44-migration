import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock sessionStorage antes da importação
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

import { saveDraft, getDraft, clearDraft } from "@/components/utils/sessionStorage";

describe("sessionStorage utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe("saveDraft", () => {
    it("should save draft to sessionStorage", () => {
      const formId = "test-form";
      const data = { name: "Test", email: "test@example.com" };
      
      saveDraft(formId, data);
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "draft_test-form",
        expect.any(String)
      );
    });

    it("should not throw on error", () => {
      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error("Storage full");
      });
      
      expect(() => saveDraft("test", {})).not.toThrow();
    });
  });

  describe("getDraft", () => {
    it("should return null when no draft exists", () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      
      const result = getDraft("test-form");
      
      expect(result).toBeNull();
    });

    it("should return data when draft exists and is valid", () => {
      const testData = { name: "Test" };
      const draftData = {
        data: testData,
        timestamp: Date.now(),
      };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(draftData));
      
      const result = getDraft("test-form");
      
      expect(result).toEqual(testData);
    });

    it("should return null and clear expired draft", () => {
      const expiredDraft = {
        data: { name: "Test" },
        timestamp: Date.now() - 4000000, // Expired (>1 hour ago)
      };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(expiredDraft));
      
      const result = getDraft("test-form");
      
      expect(result).toBeNull();
      expect(mockSessionStorage.removeItem).toHaveBeenCalled();
    });

    it("should return null on parse error", () => {
      mockSessionStorage.getItem.mockReturnValue("invalid-json");
      
      const result = getDraft("test-form");
      
      expect(result).toBeNull();
    });
  });

  describe("clearDraft", () => {
    it("should remove draft from sessionStorage", () => {
      clearDraft("test-form");
      
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith("draft_test-form");
    });

    it("should not throw on error", () => {
      mockSessionStorage.removeItem.mockImplementation(() => {
        throw new Error("Error");
      });
      
      expect(() => clearDraft("test")).not.toThrow();
    });
  });
});
