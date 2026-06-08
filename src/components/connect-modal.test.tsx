import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

type MockConnector = {
  id: string;
  type: string;
  name: string;
  uid: string;
  icon?: string;
};

const connectMock = vi.fn();
let connectorsMock: MockConnector[] = [];

vi.mock("wagmi", () => ({
  useConnectors: () => connectorsMock,
  useConnect: () => ({
    mutate: connectMock,
    isPending: false,
    variables: undefined,
    error: null,
  }),
}));

// Avoid importing the real config (which pulls in the JAW connector).
vi.mock("@/lib/wagmi", () => ({
  JAW_TYPE: "jaw",
  WALLETCONNECT_TYPE: "walletConnect",
}));

import { ConnectModal } from "./connect-modal";

const jaw: MockConnector = { id: "jaw", type: "jaw", name: "JAW", uid: "uid-jaw" };
const metamask: MockConnector = {
  id: "io.metamask",
  type: "injected",
  name: "MetaMask",
  uid: "uid-mm",
  icon: "data:image/svg+xml,icon",
};
const walletConnect: MockConnector = {
  id: "walletConnect",
  type: "walletConnect",
  name: "WalletConnect",
  uid: "uid-wc",
};

beforeEach(() => {
  connectMock.mockClear();
  connectorsMock = [jaw, metamask];
});

describe("ConnectModal", () => {
  it("pins JAW as the primary Sign In", () => {
    render(<ConnectModal onClose={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /sign in with jaw/i }),
    ).toBeInTheDocument();
  });

  it("connects with JAW when the primary button is clicked", async () => {
    const user = userEvent.setup();
    render(<ConnectModal onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /sign in with jaw/i }));

    expect(connectMock).toHaveBeenCalledWith({ connector: jaw });
  });

  it("hides EIP-6963 wallets until expanded, then connects with the chosen one", async () => {
    const user = userEvent.setup();
    render(<ConnectModal onClose={vi.fn()} />);

    expect(
      screen.queryByRole("button", { name: /metamask/i }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /use another wallet/i }),
    );
    await user.click(screen.getByRole("button", { name: /metamask/i }));

    expect(connectMock).toHaveBeenCalledWith({ connector: metamask });
  });

  it("shows an empty state and disables the toggle when no injected wallets exist", () => {
    connectorsMock = [jaw];
    render(<ConnectModal onClose={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: /no browser wallets detected/i }),
    ).toBeDisabled();
  });

  it("shows WalletConnect on its own row and connects with it", async () => {
    const user = userEvent.setup();
    connectorsMock = [jaw, walletConnect, metamask];
    render(<ConnectModal onClose={vi.fn()} />);

    // It is NOT hidden behind the "use another wallet" toggle.
    const wcButton = screen.getByRole("button", { name: /walletconnect/i });
    expect(wcButton).toBeInTheDocument();

    await user.click(wcButton);
    expect(connectMock).toHaveBeenCalledWith({ connector: walletConnect });
  });

  it("keeps WalletConnect out of the EIP-6963 'other wallets' list", async () => {
    const user = userEvent.setup();
    connectorsMock = [jaw, walletConnect, metamask];
    render(<ConnectModal onClose={vi.fn()} />);

    // Only MetaMask (the injected one) is counted in the toggle, not WC.
    await user.click(
      screen.getByRole("button", { name: /use another wallet \(1\)/i }),
    );
    expect(
      screen.getByRole("button", { name: /metamask/i }),
    ).toBeInTheDocument();
  });

  it("omits the WalletConnect row when the connector is not configured", () => {
    connectorsMock = [jaw, metamask];
    render(<ConnectModal onClose={vi.fn()} />);

    expect(
      screen.queryByRole("button", { name: /walletconnect/i }),
    ).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConnectModal onClose={onClose} />);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });
});
