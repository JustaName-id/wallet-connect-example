"use client";

import dynamic from "next/dynamic";

// The JAW connector reads `localStorage` during setup, so the whole wagmi tree
// must never run on the server. A `dynamic(ssr:false)` boundary loads it on the
// client only — no `useEffect` mount-gate, no hydration mismatch. The server
// renders the lightweight fallback below in its place.
const WalletApp = dynamic(
  () => import("./wallet-app").then((m) => m.WalletApp),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        className="rounded-xl bg-white/5 px-8 py-3.5 font-semibold text-neutral-500"
      >
        Loading wallet…
      </button>
    ),
  },
);

export function WalletSection() {
  return <WalletApp />;
}
