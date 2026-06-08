"use client";

import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWagmiConfig } from "@/lib/wagmi";
import { WalletWidget } from "./wallet-widget";

// Rendered only on the client (via the dynamic boundary in wallet-section.tsx),
// so building the config inside a lazy `useState` initializer is safe — it never
// runs during SSR.
export function WalletApp() {
  const [config] = useState(() => createWagmiConfig());
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
      }),
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletWidget />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
