"use client";

import { useState } from "react";
import { useConnection } from "wagmi";
import { ConnectModal } from "./connect-modal";
import { AccountPanel } from "./account-panel";
import { JawFeatures } from "./jaw-features";
import { JAW_TYPE } from "@/lib/wagmi";

export function WalletWidget() {
  const { isConnected, isReconnecting, connector } = useConnection();
  const [open, setOpen] = useState(false);
  const isJaw = connector?.type === JAW_TYPE;

  // On reload wagmi restores the session from storage. Show a placeholder
  // instead of flashing the "Connect Wallet" button before that resolves.
  if (isReconnecting) {
    return (
      <button
        disabled
        aria-busy="true"
        className="rounded-xl bg-white/5 px-8 py-3.5 font-semibold text-neutral-500"
      >
        Reconnecting…
      </button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex flex-col items-center gap-8">
        <AccountPanel />
        {isJaw && <JawFeatures />}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg transition hover:from-violet-500 hover:to-indigo-500"
      >
        Connect Wallet
      </button>
      {open && <ConnectModal onClose={() => setOpen(false)} />}
    </>
  );
}
