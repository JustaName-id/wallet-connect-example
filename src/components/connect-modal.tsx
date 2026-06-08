"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnect, useConnectors, type Connector } from "wagmi";
import { JAW_TYPE, WALLETCONNECT_TYPE } from "@/lib/wagmi";
import { useFocusTrap } from "@/hooks/use-focus-trap";

/** De-dupe connectors by id (EIP-6963 can surface the same wallet twice). */
function dedupeConnectors(connectors: readonly Connector[]) {
  const seen = new Set<string>();
  return connectors.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

export function ConnectModal({ onClose }: { onClose: () => void }) {
  const connectors = useConnectors();
  const { mutate: connect, isPending, variables, error } = useConnect();
  const [showOthers, setShowOthers] = useState(false);
  const dialogRef = useFocusTrap<HTMLDivElement>(true);

  const jaw = useMemo(
    () => connectors.find((c) => c.type === JAW_TYPE),
    [connectors],
  );
  const walletConnect = useMemo(
    () => connectors.find((c) => c.type === WALLETCONNECT_TYPE),
    [connectors],
  );
  // Everything else = EIP-6963 injected browser extensions. JAW and
  // WalletConnect get their own dedicated rows, so they're excluded here.
  const others = useMemo(
    () =>
      dedupeConnectors(
        connectors.filter(
          (c) => c.type !== JAW_TYPE && c.type !== WALLETCONNECT_TYPE,
        ),
      ),
    [connectors],
  );

  const pendingConnector = variables?.connector;
  const pendingId =
    isPending && pendingConnector && "id" in pendingConnector
      ? pendingConnector.id
      : undefined;

  // Close on Escape — basic modal a11y.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Connect a wallet"
        tabIndex={-1}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Sign in</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 transition hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* JAW — the default, primary call to action */}
        {jaw && (
          <button
            onClick={() => connect({ connector: jaw })}
            disabled={isPending}
            className="group flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3.5 text-left transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-lg">
              🔐
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-white">
                Sign in with JAW
              </span>
              <span className="block text-xs text-violet-200">
                Passkey · No seed phrase · Gasless
              </span>
            </span>
            {pendingId === jaw.id && (
              <span className="text-sm text-violet-200">…</span>
            )}
          </button>
        )}

        {/* WalletConnect — QR / deep link for mobile wallets. Always available
            (it's not a browser extension), so it gets its own row. */}
        {walletConnect && (
          <button
            onClick={() => connect({ connector: walletConnect })}
            disabled={isPending}
            className="mt-3 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10 disabled:opacity-60"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b99fc]/20 text-lg">
              📱
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-white">
                WalletConnect
              </span>
              <span className="block text-xs text-neutral-400">
                Scan with a mobile wallet
              </span>
            </span>
            {pendingId === walletConnect.id && (
              <span className="text-sm text-neutral-400">…</span>
            )}
          </button>
        )}

        {/* Other wallets — discovered for free via EIP-6963 */}
        <div className="mt-4">
          <button
            onClick={() => setShowOthers((v) => !v)}
            aria-expanded={showOthers}
            disabled={others.length === 0}
            className="flex w-full items-center justify-between text-sm text-neutral-400 transition hover:text-neutral-200 disabled:opacity-60"
          >
            <span>
              {others.length > 0
                ? `Use another wallet (${others.length})`
                : "No browser wallets detected"}
            </span>
            {others.length > 0 && <span>{showOthers ? "▲" : "▼"}</span>}
          </button>

          {showOthers && others.length > 0 && (
            <ul className="mt-3 space-y-2">
              {others.map((connector) => (
                <li key={connector.uid}>
                  <button
                    onClick={() => connect({ connector })}
                    disabled={isPending}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10 disabled:opacity-60"
                  >
                    {connector.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={connector.icon}
                        alt=""
                        className="h-6 w-6 rounded"
                      />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-xs">
                        {connector.name.charAt(0)}
                      </span>
                    )}
                    <span className="flex-1 font-medium text-white">
                      {connector.name}
                    </span>
                    {pendingId === connector.id && (
                      <span className="text-sm text-neutral-400">…</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error.message}
          </p>
        )}

        <p className="mt-5 text-center text-[11px] leading-relaxed text-neutral-500">
          JAW is a passkey smart account. Other wallets are discovered
          automatically via EIP-6963 — nothing is hardcoded.
        </p>
      </div>
    </div>
  );
}
