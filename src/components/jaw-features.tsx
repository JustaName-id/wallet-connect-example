"use client";

import { useState } from "react";
import {
  useSign,
  useCapabilities,
  useGetAssets,
  usePermissions,
  useGrantPermissions,
  useRevokePermissions,
  useGetCallsHistory,
} from "@jaw.id/wagmi";

/** JSON.stringify that survives bigint values (common in asset/balance data). */
function pretty(data: unknown) {
  return JSON.stringify(
    data,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
    2,
  );
}

function DataBlock({
  title,
  isLoading,
  error,
  data,
}: {
  title: string;
  isLoading: boolean;
  error: Error | null;
  data: unknown;
}) {
  return (
    <details className="rounded-xl border border-white/10 bg-white/5">
      <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-white">
        {title}
        <span className="ml-2 text-xs text-neutral-400">
          {isLoading ? "loading…" : error ? "error" : data ? "ready" : "—"}
        </span>
      </summary>
      <pre className="max-h-56 overflow-auto border-t border-white/10 px-4 py-3 text-[11px] leading-relaxed text-neutral-300">
        {error ? error.message : data ? pretty(data) : "No data."}
      </pre>
    </details>
  );
}

export function JawFeatures() {
  // Read hooks — auto-fetch for the connected JAW account.
  const capabilities = useCapabilities();
  const assets = useGetAssets();
  const permissions = usePermissions();
  const callsHistory = useGetCallsHistory();

  // Mutation hooks.
  const { mutate: sign, data: signature, isPending: isSigning, error: signError } =
    useSign();
  const { mutate: grant, isPending: isGranting, error: grantError } =
    useGrantPermissions();
  const { mutate: revoke, isPending: isRevoking, error: revokeError } =
    useRevokePermissions();

  const [message, setMessage] = useState("Hello from JustaLab 👋");
  const [revokeId, setRevokeId] = useState("");
  const isValidRevokeId = /^0x[0-9a-fA-F]+$/.test(revokeId);

  function handleSign() {
    sign({ request: { type: "0x45", data: { message } } });
  }

  function handleGrantDemo() {
    // Demo: let a spender pull up to 1 USDC/day on mainnet for the next hour.
    grant({
      expiry: Math.floor(Date.now() / 1000) + 3600,
      spender: "0x000000000000000000000000000000000000dEaD",
      permissions: {
        spends: [
          {
            token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
            allowance: "1000000", // 1 USDC (6 decimals)
            unit: "day",
            multiplier: 1,
          },
        ],
      },
    });
  }

  return (
    <section className="w-full max-w-sm space-y-4 rounded-2xl border border-violet-500/20 bg-neutral-900 p-6 text-left shadow-2xl">
      <div>
        <h3 className="font-semibold text-white">JAW smart-account features</h3>
        <p className="text-xs text-neutral-400">
          Extra hooks from <code className="font-mono">@jaw.id/wagmi</code>, only
          available on a JAW connection.
        </p>
      </div>

      {/* Sign a message (ERC-7871 wallet_sign, EIP-191 personal sign) */}
      <div className="space-y-2">
        <label
          htmlFor="jaw-sign-message"
          className="block text-xs font-medium text-neutral-300"
        >
          Sign a message
        </label>
        <input
          id="jaw-sign-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
        />
        <button
          onClick={handleSign}
          disabled={isSigning || !message}
          className="w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-60"
        >
          {isSigning ? "Signing…" : "Sign with passkey"}
        </button>
        {signError && (
          <p className="text-xs text-red-300">{signError.message}</p>
        )}
        {signature && (
          <p className="break-all rounded-lg bg-white/5 px-3 py-2 font-mono text-[11px] text-emerald-300">
            {signature}
          </p>
        )}
      </div>

      {/* Permissions: grant / revoke (ERC-7715 spend permissions) */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-neutral-300">
          Spend permissions
        </label>
        <button
          onClick={handleGrantDemo}
          disabled={isGranting}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
        >
          {isGranting ? "Granting…" : "Grant demo permission (1 USDC/day)"}
        </button>
        {grantError && (
          <p className="text-xs text-red-300">{grantError.message}</p>
        )}
        <div className="flex gap-2">
          <input
            value={revokeId}
            onChange={(e) => setRevokeId(e.target.value)}
            placeholder="permission id (0x…)"
            aria-label="Permission id to revoke"
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white outline-none focus:border-violet-500"
          />
          <button
            onClick={() => revoke({ id: revokeId as `0x${string}` })}
            disabled={isRevoking || !isValidRevokeId}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            Revoke
          </button>
        </div>
        {revokeError && (
          <p className="text-xs text-red-300">{revokeError.message}</p>
        )}
      </div>

      {/* Read-only smart-account data */}
      <div className="space-y-2">
        <DataBlock
          title="Capabilities (EIP-5792)"
          isLoading={capabilities.isLoading}
          error={capabilities.error}
          data={capabilities.data}
        />
        <DataBlock
          title="Assets"
          isLoading={assets.isLoading}
          error={assets.error}
          data={assets.data}
        />
        <DataBlock
          title="Active permissions"
          isLoading={permissions.isLoading}
          error={permissions.error}
          data={permissions.data}
        />
        <DataBlock
          title="Calls history"
          isLoading={callsHistory.isLoading}
          error={callsHistory.error}
          data={callsHistory.data}
        />
      </div>
    </section>
  );
}
