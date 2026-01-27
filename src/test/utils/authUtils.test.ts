import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(() => Promise.resolve({ 
      data: { session: null }, 
      error: null 
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

// Mock do SessionCache
vi.mock("@/components/utils/apiCache", () => ({
  SessionCache: {
    get: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

import { 
  getUserRole, 
  getUserRoleSync, 
  getDashboardPath, 
  canAccessDashboard,
  clearAuthCache 
} from "@/components/utils/authUtils";

describe("authUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthCache();
  });

  describe("getUserRole", () => {
    it("should return unauthenticated when no session", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const result = await getUserRole(true);
      
      expect(result.isAuthenticated).toBe(false);
      expect(result.needsLogin).toBe(true);
    });

    it("should return error when session check fails", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: "Session error" },
      });

      const result = await getUserRole(true);
      
      expect(result.isAuthenticated).toBe(false);
    });
  });

  describe("getUserRoleSync", () => {
    it("should return null when no cache", () => {
      const result = getUserRoleSync();
      expect(result).toBeNull();
    });
  });

  describe("getDashboardPath", () => {
    it("should return correct path for admin_master", () => {
      expect(getDashboardPath("admin_master")).toBe("/AdminMaster");
    });

    it("should return correct path for administrador", () => {
      expect(getDashboardPath("administrador")).toBe("/Dashboard");
    });

    it("should return correct path for porteiro", () => {
      expect(getDashboardPath("porteiro")).toBe("/Dashboard");
    });

    it("should return correct path for morador", () => {
      expect(getDashboardPath("morador")).toBe("/DashboardMorador");
    });

    it("should return default path for unknown type", () => {
      expect(getDashboardPath("unknown")).toBe("/DashboardMorador");
    });
  });

  describe("canAccessDashboard", () => {
    it("should allow admin_master to access any dashboard", () => {
      expect(canAccessDashboard("admin_master", "morador")).toBe(true);
      expect(canAccessDashboard("admin_master", "porteiro")).toBe(true);
      expect(canAccessDashboard("admin_master", "administrador")).toBe(true);
    });

    it("should restrict morador to morador dashboard only", () => {
      expect(canAccessDashboard("morador", "morador")).toBe(true);
      expect(canAccessDashboard("morador", "porteiro")).toBe(false);
      expect(canAccessDashboard("morador", "administrador")).toBe(false);
    });

    it("should allow porteiro access to porteiro and morador", () => {
      expect(canAccessDashboard("porteiro", "morador")).toBe(true);
      expect(canAccessDashboard("porteiro", "porteiro")).toBe(true);
      expect(canAccessDashboard("porteiro", "administrador")).toBe(false);
    });

    it("should allow administrador access to all except master", () => {
      expect(canAccessDashboard("administrador", "morador")).toBe(true);
      expect(canAccessDashboard("administrador", "porteiro")).toBe(true);
      expect(canAccessDashboard("administrador", "administrador")).toBe(true);
    });
  });

  describe("clearAuthCache", () => {
    it("should not throw when clearing cache", () => {
      expect(() => clearAuthCache()).not.toThrow();
    });
  });
});
