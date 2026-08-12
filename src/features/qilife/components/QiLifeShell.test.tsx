import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("./auth/useAuth", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));
vi.mock("../services/qilifeStore", () => ({
  seedDemoData: vi.fn().mockResolvedValue(undefined),
  isSupabaseConfigured: () => false,
  listRecords: vi.fn().mockResolvedValue([]),
  listAllRecords: vi.fn().mockResolvedValue([]),
  createRecord: vi.fn(),
  updateRecord: vi.fn(),
  archiveRecord: vi.fn(),
}));
vi.mock("./HomeDashboard", () => ({ HomeDashboard: () => <div>Home</div> }));
vi.mock("./SidebarNav", () => ({ SidebarNav: () => <div>Sidebar</div> }));
vi.mock("./Topbar", () => ({ Topbar: () => <div>Topbar</div> }));
vi.mock("./AssistantPage", () => ({ AssistantPage: () => <div>Assistant</div> }));
vi.mock("./WorkspacePage", () => ({ WorkspacePage: () => <div>Workspace</div> }));
vi.mock("./auth/LoginPage", () => ({ LoginPage: () => <div>Login</div> }));
vi.mock("./QuickCaptureModal", () => ({
  QuickCaptureModal: () => <div role="dialog">Quick Capture</div>,
}));

import { QiLifeShell } from "./QiLifeShell";

describe("QiLifeShell keyboard behavior", () => {
  it("preserves Ctrl+K quick capture", async () => {
    render(
      <MemoryRouter>
        <QiLifeShell />
      </MemoryRouter>,
    );

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
