import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock PageHeader component
vi.mock("@/components/utils/theme", () => ({
  globalStyles: {
    pageHeader: "page-header-class",
    pageTitle: "page-title-class flex items-center gap-3",
  },
}));

import PageHeader from "@/components/shared/PageHeader";

// Mock icon component
const MockIcon = () => <span data-testid="mock-icon">📋</span>;

describe("PageHeader Component", () => {
  it("should render title", () => {
    render(<PageHeader title="Test Title" />);
    
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("should render subtitle when provided", () => {
    render(<PageHeader title="Test Title" subtitle="Test Subtitle" />);
    
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
  });

  it("should render icon when provided", () => {
    render(<PageHeader title="Test Title" icon={MockIcon} />);
    
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("should render actions when provided", () => {
    render(
      <PageHeader 
        title="Test Title" 
        actions={<button>Action Button</button>}
      />
    );
    
    expect(screen.getByText("Action Button")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    render(<PageHeader title="Test Title" />);
    
    expect(screen.queryByText("Test Subtitle")).not.toBeInTheDocument();
  });
});
