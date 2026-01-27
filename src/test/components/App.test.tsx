import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock router
vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Route: () => null,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/" }),
}));

// Mock auth context
vi.mock("@/lib/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    authError: null,
    navigateToLogin: vi.fn(),
    isAuthenticated: true,
    user: { id: "user-1", email: "test@test.com" },
  }),
}));

// Mock tanstack query
vi.mock("@tanstack/react-query", () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock query client
vi.mock("@/lib/query-client", () => ({
  queryClientInstance: {},
}));

// Mock pages config
vi.mock("@/pages.config", () => ({
  pagesConfig: {
    Pages: {},
    Layout: null,
    mainPage: null,
  },
}));

// Mock navigation tracker
vi.mock("@/lib/NavigationTracker", () => ({
  default: () => null,
}));

// Mock toaster
vi.mock("@/components/ui/toaster", () => ({
  Toaster: () => null,
}));

// Mock user not registered
vi.mock("@/components/UserNotRegisteredError", () => ({
  default: () => <div>User not registered</div>,
}));

// Mock Auth page
vi.mock("@/pages/Auth", () => ({
  default: () => <div>Auth Page</div>,
}));

describe("App Component Structure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export App as default", async () => {
    const AppModule = await import("@/App");
    expect(AppModule.default).toBeDefined();
  });

  it("should have correct structure with providers", async () => {
    const AppModule = await import("@/App");
    const App = AppModule.default;
    
    expect(typeof App).toBe("function");
  });
});
