"use client";

import {
  useBalance,
  useChainId,
  useConnection,
  useDisconnect,
  useEnsName,
} from "wagmi";
import { mainnet } from "wagmi/chains";
import { formatUnits } from "viem";
import { JAW_TYPE } from "@/lib/wagmi";

function shorten(address: `0x${string}`) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function AccountPanel() {
  const { address, connector, chain } = useConnection();
  const chainId = useChainId();
  const { mutate: disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  // ENS reverse resolution always reads from mainnet.
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id });

  if (!address) return null;

  const isJaw = connector?.type === JAW_TYPE;
  const formattedBalance = balance
    ? `${Number(formatUnits(balance.value, balance.decimals)).toFixed(4)} ${balance.symbol}`
    : "—";

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-lg">
          {isJaw ? "🔐" : "👛"}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">
            {ensName ?? shorten(address)}
          </p>
          <p className="text-xs text-neutral-400">
            Connected via {connector?.name ?? "wallet"}
            {isJaw && " · passkey smart account"}
          </p>
        </div>
      </div>

      <dl className="space-y-2 rounded-xl bg-white/5 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-400">Address</dt>
          <dd className="font-mono text-white">{shorten(address)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-400">Network</dt>
          <dd className="text-white">{chain?.name ?? `chain ${chainId}`}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-400">Balance</dt>
          <dd className="text-white">{formattedBalance}</dd>
        </div>
      </dl>

      <button
        onClick={() => disconnect()}
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
      >
        Disconnect
      </button>
    </div>
  );
}
