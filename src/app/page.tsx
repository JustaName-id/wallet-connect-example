import { WalletSection } from "@/components/wallet-section";

// Server Component: the hero + banner are server-rendered. Only the wallet
// widget (which depends on the JAW connector + browser APIs) is client-only,
// loaded through a `dynamic(ssr:false)` boundary in <WalletSection />.
export default function Home() {
  const hasJawKey = Boolean(process.env.NEXT_PUBLIC_JAW_API_KEY);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-neutral-950 px-4 py-16 text-center">
      <div className="max-w-lg space-y-3">
        <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-violet-300">
          JustaLab · example
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          JAW as default Sign In
        </h1>
        <p className="text-pretty text-neutral-400">
          A custom WalletConnect-style modal with JAW pinned as the primary{" "}
          <em>Sign In</em>, and every other wallet (MetaMask, Rabby, Ambire…)
          discovered automatically via EIP-6963. All connection logic is wagmi
          underneath — nothing hardcoded.
        </p>
      </div>

      {!hasJawKey && (
        <p className="max-w-md rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          ⚠️ Set <code className="font-mono">NEXT_PUBLIC_JAW_API_KEY</code> in{" "}
          <code className="font-mono">.env.local</code> to enable JAW sign-in.
          Get a key at{" "}
          <a
            href="https://jaw.id"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            jaw.id
          </a>
          . EIP-6963 wallets still work without it.
        </p>
      )}

      <WalletSection />

      <a
        href="https://docs.jaw.id"
        target="_blank"
        rel="noreferrer"
        className="text-xs text-neutral-500 underline transition hover:text-neutral-300"
      >
        @jaw.id/wagmi docs ↗
      </a>
    </main>
  );
}
