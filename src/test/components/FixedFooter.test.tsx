import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/" }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Mock do contexto de chamados
vi.mock("@/components/utils/chamadosContext", () => ({
  useChamados: () => ({
    chamadosPendentes: 0,
    loading: false,
  }),
}));

import FixedFooter from "@/components/shared/FixedFooter";

describe("FixedFooter Component", () => {
  const mockItems = [
    {
      key: "home",
      label: "Home",
      path: "/",
      icon: () => <span data-testid="home-icon">🏠</span>,
    },
    {
      key: "settings",
      label: "Config",
      path: "/settings",
      icon: () => <span data-testid="settings-icon">⚙️</span>,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render footer items", () => {
    render(<FixedFooter items={mockItems} />);
    
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Config")).toBeInTheDocument();
  });

  it("should render icons", () => {
    render(<FixedFooter items={mockItems} />);
    
    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
  });

  it("should render links with correct paths", () => {
    render(<FixedFooter items={mockItems} />);
    
    const homeLink = screen.getByText("Home").closest("a");
    const settingsLink = screen.getByText("Config").closest("a");
    
    expect(homeLink).toHaveAttribute("href", "/");
    expect(settingsLink).toHaveAttribute("href", "/settings");
  });

  it("should not render external links", () => {
    const itemsWithExternal = [
      ...mockItems,
      {
        key: "external",
        label: "External",
        path: "https://example.com",
        icon: () => <span>🔗</span>,
        external: true,
      },
    ];
    
    render(<FixedFooter items={itemsWithExternal} />);
    
    expect(screen.queryByText("External")).not.toBeInTheDocument();
  });

  it("should show badge when provided", () => {
    const itemsWithBadge = [
      {
        key: "notifications",
        label: "Avisos",
        path: "/avisos",
        icon: () => <span>🔔</span>,
        badge: 5,
      },
    ];
    
    render(<FixedFooter items={itemsWithBadge} />);
    
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should show 9+ for badges over 9", () => {
    const itemsWithHighBadge = [
      {
        key: "notifications",
        label: "Avisos",
        path: "/avisos",
        icon: () => <span>🔔</span>,
        badge: 15,
      },
    ];
    
    render(<FixedFooter items={itemsWithHighBadge} />);
    
    expect(screen.getByText("9+")).toBeInTheDocument();
  });
});
