import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

type MockConnection = {
  isConnected: boolean;
  isReconnecting: boolean;
  connector?: { type: string };
};

let connection: MockConnection;

vi.mock("wagmi", () => ({
  useConnection: () => connection,
}));
vi.mock("@/lib/wagmi", () => ({ JAW_TYPE: "jaw" }));
vi.mock("./account-panel", () => ({
  AccountPanel: () => <div>account-panel</div>,
}));
vi.mock("./jaw-features", () => ({
  JawFeatures: () => <div>jaw-features</div>,
}));
vi.mock("./connect-modal", () => ({
  ConnectModal: () => <div role="dialog">connect-modal</div>,
}));

import { WalletWidget } from "./wallet-widget";

describe("WalletWidget", () => {
  it("shows a reconnecting placeholder while wagmi restores the session", () => {
    connection = { isConnected: false, isReconnecting: true };
    render(<WalletWidget />);

    expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^connect wallet$/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the connect button when disconnected and opens the modal on click", async () => {
    connection = { isConnected: false, isReconnecting: false };
    const user = userEvent.setup();
    render(<WalletWidget />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /connect wallet/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders the account panel and JAW features on a JAW connection", () => {
    connection = {
      isConnected: true,
      isReconnecting: false,
      connector: { type: "jaw" },
    };
    render(<WalletWidget />);

    expect(screen.getByText("account-panel")).toBeInTheDocument();
    expect(screen.getByText("jaw-features")).toBeInTheDocument();
  });

  it("hides JAW features for non-JAW wallets", () => {
    connection = {
      isConnected: true,
      isReconnecting: false,
      connector: { type: "injected" },
    };
    render(<WalletWidget />);

    expect(screen.getByText("account-panel")).toBeInTheDocument();
    expect(screen.queryByText("jaw-features")).not.toBeInTheDocument();
  });
});
