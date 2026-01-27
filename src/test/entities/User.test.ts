import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
const mockGetUser = vi.fn();
const mockSelect = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
      updateUser: vi.fn(() => Promise.resolve({ error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => mockSelect()),
        })),
      })),
    })),
  },
}));

import { User } from "@/entities/User";

describe("User Entity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("me", () => {
    it("should return null when no user authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      
      const result = await User.me();
      
      expect(result).toBeNull();
    });

    it("should return user with profile data when authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: "user-123", email: "test@example.com" },
        },
      });
      mockSelect.mockResolvedValue({
        data: { nome: "Test User", telefone: "11999999999" },
        error: null,
      });
      
      const result = await User.me();
      
      expect(result).toMatchObject({
        id: "user-123",
        email: "test@example.com",
      });
    });
  });

  describe("updatePassword", () => {
    it("should update password successfully", async () => {
      const result = await User.updatePassword("newPassword123");
      
      expect(result).toBe(true);
    });
  });
});
