import { createConfig, http } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import { mainnet, sepolia } from "wagmi/chains";
import { jaw } from "@jaw.id/wagmi";

/**
 * The connector `type` JAW registers itself under. We use this to pin JAW to
 * the top of the wallet list and tell it apart from EIP-6963 injected wallets.
 */
export const JAW_TYPE = jaw.type; // "jaw"

/**
 * The connector `type` the WalletConnect connector registers under. We use it
 * to pull WalletConnect out of the EIP-6963 list and give it its own row (it's
 * a mobile QR flow, always available — not a browser extension).
 */
export const WALLETCONNECT_TYPE = "walletConnect";

/**
 * JAW needs an API key from the JAW dashboard (https://jaw.id).
 * Put it in `.env.local` as NEXT_PUBLIC_JAW_API_KEY.
 */
export const JAW_API_KEY = process.env.NEXT_PUBLIC_JAW_API_KEY ?? "";

/**
 * WalletConnect needs a project ID from Reown Cloud (https://cloud.reown.com).
 * Put it in `.env.local` as NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. When it's
 * absent the connector is simply omitted — the modal degrades to JAW + EIP-6963.
 */
export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

/**
 * Factory — NOT called at module scope on purpose. The JAW connector touches
 * `localStorage` inside its `setup()`, which throws during SSR/prerender. It's
 * built on the client only, inside the `dynamic(ssr:false)` boundary
 * (see `wallet-section.tsx` → `wallet-app.tsx`).
 */
export function createWagmiConfig() {
  return createConfig({
    chains: [mainnet, sepolia],
    // EIP-6963 multi-wallet discovery is ON by default in wagmi v2+. MetaMask,
    // Rabby, Ambire, etc. announce themselves and show up in `useConnectors()`
    // automatically — we never hardcode them. This is the whole point: JAW is a
    // first-class connector, the rest of the extensions come for free.
    multiInjectedProviderDiscovery: true,
    connectors: [
      jaw({
        apiKey: JAW_API_KEY,
        appName: "JustaLab Example",
        appLogoUrl: null, // falls back to favicon
        defaultChainId: mainnet.id,
        preference: { showTestnets: true },
      }),
      // WalletConnect — QR / deep-link flow for mobile wallets (Rainbow, Trust,
      // MetaMask mobile…). Only registered when a project ID is configured; the
      // connector throws on init without one. `showQrModal: true` lets WC render
      // its own QR modal when the user picks it, so we don't ship a QR lib.
      ...(WALLETCONNECT_PROJECT_ID
        ? [
            walletConnect({
              projectId: WALLETCONNECT_PROJECT_ID,
              showQrModal: true,
              metadata: {
                name: "JustaLab Example",
                description:
                  "JAW as default Sign In + EIP-6963 wallet discovery.",
                url: "https://jaw.id",
                icons: [],
              },
            }),
          ]
        : []),
    ],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof createWagmiConfig>;
  }
}
